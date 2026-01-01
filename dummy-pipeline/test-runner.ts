import { runLoanApproval } from "./pipelines/loan-approval/run";

async function main() {
  await runLoanApproval();
  await runLoanApproval();
}

main();
