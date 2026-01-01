import { referenceProduct } from "./input";
import { candidateProducts } from "./data";
import XRaySDK from "@abhi1705/xray-sdk";
import { applyFilters, rankProducts } from "./steps";

export function runCompetitorSelection() {
  const xray = new XRaySDK({
    apiKey: "user_37R2mTBdr2jy1h6MBJCiSBMk8dL",
    appId: "xr_bb34cafb-2a71-44c0-a541-fdae5922fca7",
    pipeline: "loan-approval",
    environment: "dev",
  });

  const execution = xray.startExecution();
  console.log("Starting competitor selection process...");

  try {
    execution.recordStep({
      name: "load_products",
      input: {
        referenceProduct,
        candidateProducts,
      },
      reasoning: "Loaded reference and candidate products",
    });
    console.log("Products loaded.");
    const evaluations = applyFilters(referenceProduct, candidateProducts);
    execution.recordStep({
      name: "apply_filters",
      input: {
        referenceProduct,
        candidateProducts,
      },
      output: evaluations,
      reasoning: "Applied qualification filters to candidate products",
    });
    console.log("Filters applied.");

    const passed = evaluations.filter((e) => e.qualified);
    execution.recordStep({
      name: "filter_passed_products",
      input: evaluations,
      output: passed,
      reasoning: "Filtered products that passed all qualification criteria",
    });
    console.log("Filtered passed products.");
    const ranked = rankProducts(passed);
    execution.recordStep({
      name: "rank_products",
      input: passed,
      output: ranked,
      reasoning: "Ranked products based on similarity to reference product",
    });
    console.log("Products ranked.");

    execution.completeExecution();
    console.log("Execution completed successfully");

    return {
      referenceProduct,
      totalCandidates: candidateProducts.length,
      passed: passed.length,
      selected: ranked[0]?.product,
    };
  } catch (error) {
    console.error("Error during execution:", error);
    execution.failExecution();
    throw error;
  }
}
