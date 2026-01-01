import express from "express";
import bodyParser from "body-parser";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "";

const supabase = createClient(supabaseUrl, supabaseAnonKey);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

// auth middleware
async function authenticateSDK(
  req: express.Request & { appRecord?: any },
  res: express.Response,
  next: express.NextFunction
) {
  const apiKey = req.headers["x-api-key"];
  console.log("Authenticating SDK with API key:", apiKey);

  if (!apiKey) {
    console.log("Missing API key in request");
    return res.status(401).json({ error: "Missing API key" });
  }

  const { data: appRecord } = await supabase
    .from("apps")
    .select("*")
    .eq("user_id", apiKey)
    .single();

  console.log("App record lookup result:", appRecord);

  if (!appRecord) {
    console.log("Invalid API key:", apiKey);
    return res.status(401).json({ error: "Invalid API key" });
  }

  console.log("Authentication successful for app:", appRecord.id);
  req.appRecord = appRecord;
  next();
}

app.post(
  "/executions",
  authenticateSDK,
  async (req: express.Request & { appRecord?: any }, res: express.Response) => {
    const snapshot = req.body;
    const appRecord = req.appRecord;

    try {
      // 1. Insert execution
      console.log("Inserting execution:", snapshot.executionId);
      await supabase.from("executions").insert({
        id: snapshot.executionId,
        app_id: appRecord.id,
        pipeline: snapshot.pipeline,
        status: snapshot.status,
        started_at: new Date(snapshot.timestamps.start),
        ended_at: snapshot.timestamps.end
          ? new Date(snapshot.timestamps.end)
          : null,
      });

      // 2. Insert steps
      console.log("Inserting steps...");
      const steps = (snapshot.steps || []).map((step: any) => ({
        execution_id: snapshot.executionId,
        name: step.name,
        timestamp: new Date(step.timestamp),
        input: step.input,
        output: step.output,
        reasoning: step.reasoning,
        metadata: step.metadata,
      }));

      if (steps.length > 0) {
        await supabase.from("steps").insert(steps);
        console.log(`Successfully inserted ${steps.length} steps`);
      }

      console.log("Execution completed successfully");
      res.json({ success: true });
    } catch (err) {
      // DO NOT throw — ingestion must be best-effort
      console.error("Error inserting execution:", err);
      res.json({ success: false });
    }
  }
);

app.post("/auth/sync-user", async (req, res) => {
  const { clerkUserId, email } = req.body;

  if (!clerkUserId) {
    return res.status(400).json({ error: "Missing clerkUserId" });
  }

  const { data: existingUser } = await supabase
    .from("users")
    .select("*")
    .eq("clerk_user_id", clerkUserId)
    .single();

  if (existingUser) {
    console.log("User already exists:", clerkUserId);
    return res.json(existingUser);
  }

  const { data, error } = await supabase
    .from("users")
    .insert({
      clerk_user_id: clerkUserId,
      email,
    })
    .select()
    .single();

  if (error) {
    console.error("Error syncing user:", error);
    return res.status(500).json({ error: error.message });
  }

  console.log("User synced successfully:", clerkUserId);
  res.json(data);
});

// fetc all apps
app.get("/apps", async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: "Missing userId" });
  }

  const { data, error } = await supabase
    .from("apps")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    console.error("Error fetching apps:", error);
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

// create new app
app.post("/apps", async (req, res) => {
  const { userId, name } = req.body;

  if (!userId || !name) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const apiKey = `xr_${crypto.randomUUID()}`;

  const { data, error } = await supabase
    .from("apps")
    .insert({
      user_id: userId,
      name,
      api_key: apiKey,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating app:", error);
    return res.status(500).json({ error: error.message });
  }

  console.log("App created successfully:", name);
  res.status(201).json(data);
});

// GET /executions
app.get("/executions", async (req, res) => {
  const { appId, pipeline, from, to, limit = 20, offset = 0 } = req.query;

  let query = supabase
    .from("executions")
    .select("*", { count: "exact" })
    .order("started_at", { ascending: false })
    .range(Number(offset), Number(offset) + Number(limit) - 1);

  if (appId) query = query.eq("app_id", appId);
  if (pipeline) query = query.eq("pipeline", pipeline);
  if (from) query = query.gte("started_at", from);
  if (to) query = query.lte("started_at", to);

  const { data, count, error } = await query;

  if (error) return res.status(500).json({ error: error.message });

  res.json({
    data,
    total: count,
  });
});

// GET /executions/summary
app.get("/executions/summary", async (req, res) => {
  const { appId, from, to } = req.query;

  let query = supabase.from("executions").select("started_at, ended_at");

  if (appId) query = query.eq("app_id", appId);
  if (from) query = query.gte("started_at", from);
  if (to) query = query.lte("started_at", to);

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });

  const total = data.length;
  const completed = data.filter((e) => e.ended_at);
  const running = total - completed.length;

  const avgDurationMs =
    completed.reduce(
      (sum, e) =>
        sum +
        (new Date(e.ended_at!).getTime() - new Date(e.started_at).getTime()),
      0
    ) / (completed.length || 1);

  res.json({
    totalExecutions: total,
    completed: completed.length,
    running,
    avgDurationMs: Math.round(avgDurationMs),
  });
});

// GET /executions/:executionId
app.get("/executions/:executionId", async (req, res) => {
  const { executionId } = req.params;

  const { data: execution, error: execErr } = await supabase
    .from("executions")
    .select("*")
    .eq("id", executionId)
    .single();

  if (execErr) return res.status(404).json({ error: "Execution not found" });

  const { data: steps, error: stepErr } = await supabase
    .from("steps")
    .select("*")
    .eq("execution_id", executionId)
    .order("timestamp", { ascending: true });

  if (stepErr) return res.status(500).json({ error: stepErr.message });

  res.json({
    execution,
    steps,
  });
});

app.get("/analytics/steps", async (req, res) => {
  const { appId } = req.query;

  let query = supabase.from("steps").select("name, execution_id");

  if (appId) {
    const { data: execs } = await supabase
      .from("executions")
      .select("id")
      .eq("app_id", appId);

    const ids = execs?.map((e) => e.id) || [];
    query = query.in("execution_id", ids);
  }

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });

  const counts: Record<string, number> = {};

  data.forEach((s) => {
    counts[s.name] = (counts[s.name] || 0) + 1;
  });

  res.json(
    Object.entries(counts).map(([step, count]) => ({
      step,
      count,
    }))
  );
});

app.get("/analytics/pipelines", async (req, res) => {
  const { appId } = req.query;

  let query = supabase.from("executions").select("pipeline");

  if (appId) query = query.eq("app_id", appId);

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });

  const counts: Record<string, number> = {};

  data.forEach((e) => {
    counts[e.pipeline] = (counts[e.pipeline] || 0) + 1;
  });

  res.json(
    Object.entries(counts).map(([pipeline, executions]) => ({
      pipeline,
      executions,
    }))
  );
});

app.get("/", (req: express.Request, res: express.Response) => {
  res.send("Welcome to my server!");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
