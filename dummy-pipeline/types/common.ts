export type PipelineResult<T = unknown> = {
  pipelineName: string;
  status: "SUCCESS" | "FAILED";
  output: T;
};

export type EvaluationResult<T> = {
  item: T;
  qualified: boolean;
  reasons: string[];
};

export type Decision<T = unknown> = {
  decision: string;
  confidence?: number;
  metadata?: T;
};
