export function calculateRiskScore(applicant: any) {
  let score = 0;

  if (applicant.creditScore < 700) score += 30;
  if (applicant.existingLoans > 1) score += 20;
  if (applicant.monthlyIncome < 50000) score += 20;

  return score;
}
