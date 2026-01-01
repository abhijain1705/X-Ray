export type StaticConfig = {
    apiKey: string;
    appId: string;
    pipeline: string;
    environment?: "dev" | "prod";
};
export type ExecutionOptions = StaticConfig & {
    executionId: string;
    steps: StepInput[];
    status: "pending" | "in_progress" | "completed" | "failed";
    timestamps: {
        start: number;
        end?: number;
    };
};
export type StepInput = {
    name: string;
    timestamp?: number;
    status?: "pending" | "in_progress" | "completed" | "failed";
    input?: unknown;
    output?: unknown;
    reasoning?: string;
    metadata?: Record<string, any>;
};
export declare function safeJson(data: unknown): any;
declare class XRaySDK {
    private config;
    constructor(config: StaticConfig);
    startExecution(): {
        recordStep: (step: StepInput) => void;
        completeExecution: () => void;
        failExecution: () => void;
        getSnapshot: () => any;
    };
}
export default XRaySDK;
