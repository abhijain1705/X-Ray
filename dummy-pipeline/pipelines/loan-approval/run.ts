import { applicant } from "./input";
import { calculateRiskScore } from "./rules";
import XRaySDK from "@abhi1705/xray-sdk";

export function runLoanApproval() {
  const xray = new XRaySDK({
    apiKey: "dummy-api-key",
    appId: "dummy-pipeline",
    pipeline: "loan-approval",
    environment: "dev",
  });

  const execution = xray.startExecution();

  try {
    execution.recordStep({
      name: "load_applicant",
      input: applicant,
      reasoning: "Using applicant profile as input",
    });

    const riskScore = calculateRiskScore(applicant);

    execution.recordStep({
      name: "calculate_risk_score",
      input: applicant,
      output: riskScore,
      reasoning: "Applied risk scoring rules",
    });

    const decision = riskScore > 60 ? "REJECTED" : "APPROVED";

    execution.recordStep({
      name: "final_decision",
      input: riskScore,
      output: decision,
      reasoning: "Threshold check (score > 60)",
    });

    execution.completeExecution();

    return {
      applicant,
      riskScore,
      decision,
    };
  } catch (err) {
    execution.failExecution();
    throw err;
  }
}
