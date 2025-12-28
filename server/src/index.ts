import express from "express";
import bodyParser from "body-parser";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "";

const supabase = createClient(supabaseUrl, supabaseAnonKey);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// auth middleware
async function authenticateSDK(
    req: express.Request & { appRecord?: any },
    res: express.Response,
    next: express.NextFunction
) {
    const apiKey = req.headers["x-api-key"];

    if (!apiKey) {
        return res.status(401).json({ error: "Missing API key" });
    }

    const { data: appRecord } = await supabase
        .from("apps")
        .select("*")
        .eq("api_key", apiKey)
        .single();

    if (!appRecord) {
        return res.status(401).json({ error: "Invalid API key" });
    }

    req.appRecord = appRecord;
    next();
}

app.post("/executions", authenticateSDK, async (req: express.Request & { appRecord?: any }, res: express.Response) => {
    const snapshot = req.body;
    const appRecord = req.appRecord;

    try {
        // 1. Insert execution
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
        }

        res.json({ success: true });
    } catch (err) {
        // DO NOT throw — ingestion must be best-effort
        res.json({ success: false });
    }
});

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
        return res.status(500).json({ error: error.message });
    }

    res.json(data);
});

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
        return res.status(500).json({ error: error.message });
    }

    res.json(data);
});

app.get("/", (req: express.Request, res: express.Response) => {
    res.send("Welcome to my server!");
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
