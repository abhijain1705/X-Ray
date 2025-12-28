# X-Ray SDK

A lightweight TypeScript SDK for recording and visualizing multi-step decision executions. X-Ray provides visibility into how complex decisions are made in your applications without requiring heavy infrastructure or event streaming systems.

## Overview

X-Ray SDK integrates seamlessly into your application to:

- Record multi-step execution flows in real-time
- Capture input, output, and reasoning at each step
- Track execution metadata and timestamps
- Send execution data to the X-Ray backend for visualization and analysis

Perfect for loan approval pipelines, competitor selection algorithms, or any multi-step decision system.

## Installation

```bash
npm install @abhi1705/xray-sdk
```

## Quick Start

### 1. Initialize the SDK

```typescript
import { XRaySDK } from "@abhi1705/xray-sdk";

const sdk = new XRaySDK({
  apiKey: "your-api-key",
  appId: "your-app-id",
  pipeline: "loan-approval",
  environment: "prod", // optional: 'dev' or 'prod', defaults to 'prod'
});
```

### 2. Start an Execution

```typescript
const execution = sdk.startExecution();
```

### 3. Record Steps

```typescript
execution.recordStep({
  name: "credit-check",
  status: "in_progress",
  input: { applicantId: "12345" },
  reasoning: "Validating credit score",
});

// ... perform your logic ...

execution.recordStep({
  name: "credit-check",
  status: "completed",
  output: { creditScore: 750, approved: true },
  metadata: { source: "equifax" },
});
```

### 4. Complete Execution

```typescript
execution.complete();

// or with failure
execution.fail({
  error: "Credit check failed",
  reason: "API timeout",
});
```

## Configuration

### StaticConfig

The SDK requires the following configuration:

```typescript
type StaticConfig = {
  apiKey: string; // Your API key from X-Ray dashboard
  appId: string; // Application identifier
  pipeline: string; // Pipeline name (e.g., 'loan-approval')
  environment?: "dev" | "prod"; // Optional, defaults to 'prod'
};
```

## API Reference

### XRaySDK

#### Constructor

```typescript
constructor(config: StaticConfig)
```

Initializes the SDK with your configuration. Throws an error if `apiKey`, `appId`, or `pipeline` are missing.

#### Methods

- **`startExecution()`**: Begins a new execution flow and returns an execution handler

### Execution Object

#### Methods

- **`recordStep(step: StepInput)`**: Records a step in the execution
- **`complete()`**: Marks execution as successfully completed
- **`fail(error: { error: string; reason?: string })`**: Marks execution as failed

### StepInput

```typescript
type StepInput = {
  name: string; // Step name/identifier
  timestamp?: number; // Optional timestamp (ms), auto-generated if omitted
  status?: "pending" | "in_progress" | "completed" | "failed"; // Step status
  input?: unknown; // Step input data
  output?: unknown; // Step output data
  reasoning?: string; // Why this step was taken
  metadata?: Record<string, any>; // Additional metadata
};
```

## Usage Examples

### Loan Approval Pipeline

```typescript
import { XRaySDK } from "@abhi1705/xray-sdk";

const sdk = new XRaySDK({
  apiKey: "sk_live_123456",
  appId: "lending-platform",
  pipeline: "loan-approval",
});

async function approveLoan(applicantData) {
  const execution = sdk.startExecution();

  try {
    // Step 1: Credit Check
    execution.recordStep({
      name: "credit-check",
      status: "in_progress",
      input: { applicantId: applicantData.id },
    });

    const creditScore = await checkCredit(applicantData.id);

    execution.recordStep({
      name: "credit-check",
      status: "completed",
      output: { creditScore },
      reasoning: "Retrieved credit score from Equifax",
    });

    // Step 2: Income Verification
    execution.recordStep({
      name: "income-verification",
      status: "in_progress",
    });

    const income = await verifyIncome(applicantData);

    execution.recordStep({
      name: "income-verification",
      status: "completed",
      output: { monthlyIncome: income },
    });

    // Step 3: Risk Assessment
    const decision = assessRisk({
      creditScore,
      income,
      loanAmount: applicantData.loanAmount,
    });

    execution.recordStep({
      name: "risk-assessment",
      status: "completed",
      output: { riskLevel: decision.risk, approved: decision.approved },
      reasoning: `Credit: ${creditScore}, Income: ${income}, Risk: ${decision.risk}`,
    });

    execution.complete();
    return decision;
  } catch (error) {
    execution.fail({
      error: error.message,
      reason: "Processing error in loan approval",
    });
    throw error;
  }
}
```

### Competitor Selection Pipeline

```typescript
const execution = sdk.startExecution();

execution.recordStep({
  name: "market-analysis",
  status: "completed",
  output: { competitors: ["Company A", "Company B"] },
  metadata: { analysisVersion: "2.1", region: "US" },
});

execution.recordStep({
  name: "competitor-ranking",
  status: "completed",
  output: { ranked: ["Company A", "Company B"] },
  reasoning: "Ranked by market share and innovation score",
});

execution.complete();
```

## Error Handling

The SDK automatically handles:

- Network failures (gracefully swallows errors to avoid blocking your application)
- Invalid configuration (throws on SDK initialization)

Always wrap execution logic in try-catch blocks for proper error handling:

```typescript
try {
  const execution = sdk.startExecution();
  // ... record steps ...
  execution.complete();
} catch (error) {
  console.error("Execution failed:", error);
  // Handle error appropriately
}
```

## Environment Setup

Set the server API endpoint via environment variable:

```bash
export SERVER_API="https://your-xray-backend.com"
```

## Data Privacy

X-Ray SDK:

- Only sends data when explicitly recorded via `recordStep()`
- Respects your `input`, `output`, and `metadata` structure
- Transmits data over HTTPS to the configured backend
- Does not track or store sensitive data beyond what you provide

## Support & Feedback

- **GitHub Issues**: [Report bugs or suggest features](https://github.com/abhijain1705/X-Ray/issues)
- **Documentation**: [Full API docs](https://github.com/abhijain1705/X-Ray/tree/main/docs)
- **Dashboard**: Visualize your executions in the X-Ray dashboard

## License

ISC - See LICENSE file for details

## Version

Current version: 1.0.0
