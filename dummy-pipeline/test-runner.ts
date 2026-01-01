import { runLoanApproval } from "./pipelines/loan-approval/run";
import { runCompetitorSelection } from "./pipelines/competitor-selection/run";

async function main() {
  await runLoanApproval();
  await runLoanApproval();
  await runCompetitorSelection();
}

main();
