/**
 * Calculate value score for a cannabis product
 * Formula: mgTHC / priceUSD
 * 
 * mgTHC = weightGrams * 1000 * (thcPercent / 100)
 */

export interface ProductData {
  thcPercent: number | null;
  weightGrams: number | null;
  priceUSD: number;
  productType: string;
}

export interface ValueScoreResult {
  mgTHC: number | null;
  valueScore: number;
  dealLabel: 'STEAL' | 'SOLID' | 'MID';
}

/**
 * Calculate milligrams of THC
 */
export function calculateMgTHC(
  thcPercent: number | null,
  weightGrams: number | null
): number | null {
  if (!thcPercent || !weightGrams) {
    return null;
  }

  return weightGrams * 1000 * (thcPercent / 100);
}

/**
 * Calculate value score (mgTHC per dollar)
 */
export function calculateValueScore(
  thcPercent: number | null,
  weightGrams: number | null,
  priceUSD: number
): number {
  if (!priceUSD || priceUSD <= 0) {
    return 0;
  }

  const mgTHC = calculateMgTHC(thcPercent, weightGrams);
  if (!mgTHC) {
    return 0;
  }

  return mgTHC / priceUSD;
}

/**
 * Get deal label based on value score and product type
 */
export function getDealLabel(
  valueScore: number,
  productType: string
): 'STEAL' | 'SOLID' | 'MID' {
  // Thresholds by product type
  const thresholds: Record<string, { steal: number; solid: number }> = {
    flower: { steal: 20, solid: 15 },
    cart: { steal: 10, solid: 7 },
    edible: { steal: 5, solid: 3 },
    concentrate: { steal: 25, solid: 18 },
    topical: { steal: 3, solid: 2 },
    other: { steal: 15, solid: 10 },
  };

  const thresh = thresholds[productType.toLowerCase()] || thresholds.other;

  if (valueScore >= thresh.steal) return 'STEAL';
  if (valueScore >= thresh.solid) return 'SOLID';
  return 'MID';
}

/**
 * Calculate complete value score with label
 */
export function calculateValueScoreComplete(
  data: ProductData
): ValueScoreResult {
  const mgTHC = calculateMgTHC(data.thcPercent, data.weightGrams);
  const valueScore = calculateValueScore(
    data.thcPercent,
    data.weightGrams,
    data.priceUSD
  );
  const dealLabel = getDealLabel(valueScore, data.productType);

  return {
    mgTHC,
    valueScore,
    dealLabel,
  };
}

