import { applicant } from "./input";
import { calculateRiskScore } from "./rules";

export function runLoanApproval() {
  const riskScore = calculateRiskScore(applicant);

  return {
    applicant,
    riskScore,
    decision: riskScore > 60 ? "REJECTED" : "APPROVED",
  };
}
