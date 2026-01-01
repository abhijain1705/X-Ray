import dotenv from "dotenv";
dotenv.config();
export function safeJson(data) {
    try {
        return JSON.parse(JSON.stringify(data));
    }
    catch {
        return "[unserializable]";
    }
}
class XRaySDK {
    constructor(config) {
        const { apiKey, appId, pipeline, environment } = config;
        if (!apiKey || !appId || !pipeline) {
            throw new Error("apiKey, appId, and pipeline are required in the config.");
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
        console.log("Starting execution:", executionId);
        const execution = {
            ...this.config,
            executionId,
            steps: [],
            status: "pending",
            timestamps: { start: Date.now() },
        };
        async function flushExecutionData() {
            try {
                console.log("Flushing execution data:", execution);
                await fetch(`https://x-ray-rw4x.onrender.com/executions`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(safeJson(execution)),
                });
                console.log("Execution data flushed successfully");
            }
            catch (error) {
                console.error("Error flushing execution data:", error);
            }
        }
        const recordStep = (step) => {
            try {
                console.log("Recording step:", step);
                if (!step?.name) {
                    console.warn("Step name is missing");
                    return;
                }
                if (execution.status === "completed" || execution.status === "failed") {
                    console.warn("Execution already completed or failed, skipping step");
                    return;
                }
                execution.steps.push({
                    ...step,
                    timestamp: step.timestamp ?? Date.now(),
                    status: step.status ?? "pending",
                });
                execution.status = "in_progress";
                console.log("Step recorded, execution status:", execution.status);
            }
            catch (error) {
                console.error("Error recording step:", error);
            }
        };
        const completeExecution = () => {
            try {
                console.log("Completing execution:", executionId);
                if (execution.status === "completed" || execution.status === "failed") {
                    console.warn("Execution already in final state");
                    return;
                }
                execution.status = "completed";
                execution.timestamps.end = Date.now();
                flushExecutionData();
            }
            catch (error) {
                console.error("Error completing execution:", error);
            }
        };
        const failExecution = () => {
            try {
                console.log("Failing execution:", executionId);
                if (execution.status === "completed" || execution.status === "failed") {
                    console.warn("Execution already in final state");
                    return;
                }
                execution.status = "failed";
                execution.timestamps.end = Date.now();
                flushExecutionData();
            }
            catch (error) {
                console.error("Error failing execution:", error);
            }
        };
        const getSnapshot = () => {
            console.log("Getting execution snapshot");
            return safeJson(execution);
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
