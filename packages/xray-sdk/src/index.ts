import { ExecutionOptions, StaticConfig, StepInput } from "./types";
import { safeJson } from "./util";

class XRaySDK {
  private config: StaticConfig;

  constructor(config: StaticConfig) {
    const { apiKey, appId, pipeline, environment } = config;

    if (!apiKey || !appId || !pipeline) {
      throw new Error(
        "apiKey, appId, and pipeline are required in the config."
      );
    }

    this.config = {
      apiKey,
      appId,
      pipeline,
      environment: environment || "prod",
    };
  }

  startExecution() {
    const executionId = crypto.randomUUID();

    const execution: ExecutionOptions = {
      ...this.config,
      executionId,
      steps: [],
      status: "pending",
      timestamps: { start: Date.now() },
    };

    async function flushExecutionData() {
      try {
        const endpoint = process.env.XRAY_ENDPOINT || "http://localhost:4000";
        await fetch(`${endpoint}/executions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": execution.apiKey,
          },
          body: JSON.stringify(safeJson(execution)),
        });
      } catch (error) {
        // swallow
      }
    }

    const recordStep = (step: StepInput) => {
      try {
        if (!step?.name) return;
        if (execution.status === "completed" || execution.status === "failed") {
          return;
        }

        execution.steps.push({
          ...step,
          timestamp: step.timestamp ?? Date.now(),
          status: step.status ?? "pending",
        });

        execution.status = "in_progress";
      } catch {
        // swallow
      }
    };

    const completeExecution = () => {
      try {
        if (execution.status === "completed" || execution.status === "failed") {
          return;
        }
        execution.status = "completed";
        execution.timestamps.end = Date.now();
        flushExecutionData();
      } catch {
        // swallow
      }
    };

    const failExecution = () => {
      try {
        if (execution.status === "completed" || execution.status === "failed") {
          return;
        }
        execution.status = "failed";
        execution.timestamps.end = Date.now();
        flushExecutionData();
      } catch {
        // swallow
      }
    };

    const getSnapshot = () => {
      return structuredClone(execution);
    };

    return {
      recordStep,
      completeExecution,
      failExecution,
      getSnapshot,
    };
  }
}

export default XRaySDK;
