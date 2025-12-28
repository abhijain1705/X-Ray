# X-Ray SDK

**TypeScript SDK for recording decision executions.**

The X-Ray SDK captures multi-step decision processes in your application and sends a snapshot to the X-Ray backend for persistence and visualization.

## Installation

```bash
npm install @xray/sdk
```

Or with pnpm:

```bash
pnpm add @xray/sdk
```

## Quick Start

### 1. Initialize the SDK

```typescript
import XRaySDK from "@xray/sdk";

const xray = new XRaySDK({
  apiKey: process.env.XRAY_API_KEY || "xr_...", // obtained from dashboard
  appId: "my-loan-app", // your application identifier
  pipeline: "loan-approval", // pipeline/workflow name
  environment: "prod", // optional: 'dev' | 'prod'
});
```

### 2. Start an Execution

```typescript
const execution = xray.startExecution();
```

### 3. Record Steps

```typescript
execution.recordStep({
  name: "fetch_credit_score",
  input: { userId: "123" },
  output: { score: 750 },
  status: "completed",
});

execution.recordStep({
  name: "calculate_risk_tier",
  input: { score: 750 },
  output: { tier: "A" },
  reasoning: "Score >= 700 → Tier A",
  status: "completed",
});
```

### 4. Complete or Fail

```typescript
execution.completeExecution();
// OR
execution.failExecution();
```

## API Reference

### `new XRaySDK(config)`

Creates an SDK instance.

**Parameters:**

```typescript
{
  apiKey: string;        // Required. API key (format: xr_...)
  appId: string;         // Required. Application identifier
  pipeline: string;      // Required. Pipeline/workflow name
  environment?: string;  // Optional. 'dev' | 'prod' (default: 'prod')
}
```

**Example:**

```typescript
const xray = new XRaySDK({
  apiKey: process.env.XRAY_API_KEY,
  appId: "credit-check",
  pipeline: "loan-underwriting",
  environment: process.env.NODE_ENV === "production" ? "prod" : "dev",
});
```

### `execution = xray.startExecution()`

Starts a new execution and returns execution methods.

**Returns:** Object with methods:

- `recordStep(step)`
- `completeExecution()`
- `failExecution()`
- `getSnapshot()`

**Example:**

```typescript
const execution = xray.startExecution();
```

### `execution.recordStep(step)`

Records a single step in the execution.

**Parameters:**

```typescript
{
  name: string;                    // Required. Step identifier
  timestamp?: number;              // Optional. Unix ms (default: now)
  status?: 'pending' | 'in_progress' | 'completed' | 'failed';  // Optional
  input?: unknown;                 // Optional. Step input
  output?: unknown;                // Optional. Step output
  reasoning?: string;              // Optional. Why was this decision made?
  metadata?: Record<string, any>;  // Optional. Custom data
}
```

**Example:**

```typescript
execution.recordStep({
  name: "check_rules_engine",
  input: { userId, riskTier },
  output: { approved: true, rules: ["tier_a_auto_approve"] },
  reasoning: "Applied automatic approval for Tier A customers",
  metadata: { ruleVersion: "v2.1", timeTaken: 45 },
  status: "completed",
});
```

**Notes:**

- Steps are buffered in memory until `completeExecution()` or `failExecution()` is called
- `recordStep()` is synchronous and non-blocking
- If a step has no `name`, it is silently ignored
- You can record steps after `completeExecution()` — they will be ignored

### `execution.completeExecution()`

Marks the execution as completed and flushes the snapshot to the backend.

**Example:**

```typescript
execution.completeExecution();
```

**Notes:**

- This triggers an asynchronous HTTP POST to the backend
- Your code does not wait for the POST to complete
- If the POST fails (network error, server down), it is silently dropped

### `execution.failExecution()`

Marks the execution as failed and flushes the snapshot to the backend.

**Example:**

```typescript
try {
  // decision logic
} catch (error) {
  execution.failExecution();
  throw error;
}
```

**Notes:**

- Same behavior as `completeExecution()` — snapshot is flushed asynchronously
- Use this when the decision process encounters an error

### `snapshot = execution.getSnapshot()`

Returns the current execution snapshot without flushing.

**Example:**

```typescript
const snapshot = execution.getSnapshot();
console.log(snapshot);
// {
//   executionId: 'uuid',
//   appId: 'my-loan-app',
//   pipeline: 'loan-approval',
//   environment: 'prod',
//   status: 'in_progress',
//   steps: [...],
//   timestamps: { start: 1234567890 }
// }
```

**Notes:**

- This is useful for debugging or logging
- Returns a deep copy (modifications don't affect the execution)

## Configuration

### Environment Variables

The SDK respects these environment variables:

| Variable        | Purpose                                        |
| --------------- | ---------------------------------------------- |
| `XRAY_API_KEY`  | API key for backend authentication             |
| `XRAY_ENDPOINT` | Backend URL (default: `http://localhost:4000`) |

**Example (.env):**

```env
XRAY_API_KEY=xr_abc123...
XRAY_ENDPOINT=https://xray.example.com
```

In code, you can still override:

```typescript
const xray = new XRaySDK({
  apiKey: process.env.XRAY_API_KEY!,
  appId: "my-app",
  pipeline: "approval",
});
```

## Design Philosophy

### Why Snapshots?

The SDK uses a **snapshot-based** model instead of event-based streaming:

1. **No per-step network overhead** — steps are buffered in memory
2. **Simple failure semantics** — a single failed POST loses one execution, not a cascade
3. **No infrastructure** — no message queues, no streaming clusters
4. **Best-effort** — if the backend is down, the snapshot is silently dropped

This trades real-time visibility for simplicity. Perfect for debugging and observability. Not for critical, transactional scenarios.

### Trade-offs

**Advantages:**

- Simple to integrate (one SDK instance per request/context)
- Zero dependencies
- Non-blocking
- Stateless (no session management)

**Limitations:**

- Lost snapshots if the backend is unreachable
- Latency between execution and backend visibility
- Not suitable for high-frequency, low-latency observability

## Non-Blocking Design

The SDK never blocks your application:

```typescript
const execution = xray.startExecution();

// These are all synchronous
execution.recordStep({ name: 'step1', ... });
execution.recordStep({ name: 'step2', ... });

// This triggers an async flush (fire-and-forget)
execution.completeExecution();

// Your code continues immediately
console.log('done'); // This prints right away, no waiting for the POST
```

The HTTP POST to the backend happens in the background. If it fails, your application is unaffected.

## Error Handling

The SDK silently ignores errors:

```typescript
const execution = xray.startExecution();

// These will not throw, even if something goes wrong
execution.recordStep({
  /* ... */
});
execution.completeExecution();
```

This is intentional. Observability should never bring down your app.

If you need to debug SDK issues locally, you can:

```typescript
const snapshot = execution.getSnapshot();
console.log("Execution snapshot:", snapshot);
```

## Examples

### Loan Approval Workflow

```typescript
import XRaySDK from "@xray/sdk";

async function approveLoan(application: LoanApplication) {
  const xray = new XRaySDK({
    apiKey: process.env.XRAY_API_KEY,
    appId: "loan-processor",
    pipeline: "loan-approval",
  });

  const execution = xray.startExecution();

  try {
    // Step 1: Fetch credit score
    const creditScore = await fetchCreditScore(application.userId);
    execution.recordStep({
      name: "fetch_credit_score",
      input: { userId: application.userId },
      output: { score: creditScore },
      status: "completed",
    });

    // Step 2: Calculate risk tier
    const riskTier = calculateRiskTier(creditScore);
    execution.recordStep({
      name: "calculate_risk_tier",
      input: { creditScore },
      output: { tier: riskTier },
      reasoning: `Score ${creditScore} → Tier ${riskTier}`,
      status: "completed",
    });

    // Step 3: Check approval rules
    const approved =
      riskTier === "A" || (creditScore > 720 && application.income > 50000);
    execution.recordStep({
      name: "check_approval_rules",
      input: { riskTier, creditScore, income: application.income },
      output: { approved },
      reasoning: approved
        ? "Approved: Meets tier or income+score criteria"
        : "Rejected: Does not meet criteria",
      metadata: { ruleVersion: "v1.2.3" },
      status: "completed",
    });

    execution.completeExecution();
    return { approved };
  } catch (error) {
    execution.failExecution();
    throw error;
  }
}
```

### Decision Tree Evaluation

```typescript
function evaluateDecisionTree(input: unknown) {
  const xray = new XRaySDK({
    apiKey: process.env.XRAY_API_KEY,
    appId: "decision-engine",
    pipeline: "tree-eval",
  });

  const execution = xray.startExecution();

  let node = tree.root;
  while (!node.isLeaf) {
    const decision = node.evaluator(input);
    execution.recordStep({
      name: `evaluate_${node.id}`,
      input: { condition: node.condition },
      output: { decision },
      status: "completed",
    });

    node = decision ? node.left : node.right;
  }

  execution.recordStep({
    name: "leaf_reached",
    output: { result: node.value },
    status: "completed",
  });

  execution.completeExecution();
  return node.value;
}
```

## Troubleshooting

### "apiKey, appId, and pipeline are required"

You passed an incomplete config to the constructor. Ensure all three are provided:

```typescript
const xray = new XRaySDK({
  apiKey: "xr_...", // Required
  appId: "my-app", // Required
  pipeline: "workflow", // Required
});
```

### Snapshots not appearing in the dashboard

1. Check the backend is running: `curl http://localhost:4000/`
2. Verify the API key is correct and exists in the `apps` table
3. Check server logs for errors
4. Ensure Supabase is reachable and credentials are correct

### High memory usage

If you create many executions without completing them, memory will grow. Ensure you call `completeExecution()` or `failExecution()` for every execution you start.

## Performance

The SDK has minimal overhead:

- **Step recording**: ~0.1ms per step (synchronous, in-memory append)
- **Snapshot creation**: ~0.5ms for 100 steps
- **Network**: Asynchronous, non-blocking

For typical workloads (5–50 steps per execution), overhead is negligible.

## TypeScript Support

The SDK is fully typed. All API methods and configuration objects have complete type information.

```typescript
import XRaySDK, { StaticConfig, ExecutionOptions, StepInput } from "@xray/sdk";

const config: StaticConfig = {
  /* ... */
};
const xray = new XRaySDK(config);
```

## FAQ

**Q: Can I use the SDK in a browser?**  
A: Not yet. It's designed for server-side use. Browser SDK is on the roadmap.

**Q: What if the backend is down?**  
A: The snapshot is silently dropped. Your application continues normally.

**Q: Can I retry failed snapshots?**  
A: No, not in v0.1. This is a planned feature.

**Q: How much data can a snapshot contain?**  
A: Practically unlimited, but keep payloads < 10MB for safety. The SDK uses JSON stringification, so ensure `input`, `output`, and `metadata` are serializable.

**Q: Does the SDK support authentication besides API keys?**  
A: Not in v0.1. API keys only.

---

## Support

- **Issues**: [GitHub Issues](https://github.com/abhijain1705/x-ray/issues)
- **Discussions**: [GitHub Discussions](https://github.com/abhijain1705/x-ray/discussions)
- **Docs**: See the main [README](../../README.md) and [Security Policy](../../SECURITY.md)

## License

MIT. See [LICENSE](../../LICENSE) for details.
