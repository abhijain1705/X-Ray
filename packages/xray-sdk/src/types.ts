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
  timestamps: { start: number; end?: number };
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
