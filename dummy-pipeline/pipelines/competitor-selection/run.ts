import { referenceProduct } from "./input";
import { candidateProducts } from "./data";
import { applyFilters, rankProducts } from "./steps";

export function runCompetitorSelection() {
  const evaluations = applyFilters(referenceProduct, candidateProducts);

  const passed = evaluations.filter((e) => e.qualified);
  const ranked = rankProducts(passed);

  return {
    referenceProduct,
    totalCandidates: candidateProducts.length,
    passed: passed.length,
    selected: ranked[0]?.product,
  };
}
