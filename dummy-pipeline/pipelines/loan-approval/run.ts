import { applicant } from "./input";
import { calculateRiskScore } from "./rules";
import XRaySDK from "@abhi1705/xray-sdk";

export function runLoanApproval() {
  const xray = new XRaySDK({
    apiKey: "user_37R2mTBdr2jy1h6MBJCiSBMk8dL",
    appId: "xr_bb34cafb-2a71-44c0-a541-fdae5922fca7",
    pipeline: "loan-approval",
    environment: "dev",
  });

  const execution = xray.startExecution();

  try {
    console.log("Starting loan approval process...");

    execution.recordStep({
      name: "load_applicant",
      input: applicant,
      reasoning: "Using applicant profile as input",
    });
    console.log("Applicant loaded:", applicant);

    const riskScore = calculateRiskScore(applicant);

    execution.recordStep({
      name: "calculate_risk_score",
      input: applicant,
      output: riskScore,
      reasoning: "Applied risk scoring rules",
    });
    console.log("Risk score calculated:", riskScore);

    const decision = riskScore > 60 ? "REJECTED" : "APPROVED";

    execution.recordStep({
      name: "final_decision",
      input: riskScore,
      output: decision,
      reasoning: "Threshold check (score > 60)",
    });
    console.log("Final decision:", decision);

    execution.completeExecution();
    console.log("Execution completed successfully");

    return {
      applicant,
      riskScore,
      decision,
    };
  } catch (err) {
    console.error("Error during execution:", err);
    execution.failExecution();
    throw err;
  }
}
