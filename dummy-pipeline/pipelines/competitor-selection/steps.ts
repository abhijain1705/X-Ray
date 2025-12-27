export function applyFilters(reference: any, candidates: any[]) {
  const minPrice = reference.price * 0.5;
  const maxPrice = reference.price * 2;

  return candidates.map((product) => {
    const failures = [];

    if (product.price < minPrice) failures.push("price below minimum");

    if (product.rating < 3.8) failures.push("rating below threshold");

    if (product.reviews < 100) failures.push("insufficient reviews");

    return {
      product,
      qualified: failures.length === 0,
      failures,
    };
  });
}

export function rankProducts(qualified: any[]) {
  return qualified.sort((a, b) => b.product.reviews - a.product.reviews);
}
