export const BOOK_WEIGHT_G = 182;
export const PACKAGING_WEIGHT_G = 50;

/**
 * Calculates the shipping cost based on the state and quantity of books.
 * Uses India Post Regular Parcel tariffs and adds 18% GST.
 */
export function calculateShipping(state: string, quantity: number): number {
  if (!state || quantity < 1) return 0;

  const totalWeight = quantity * (BOOK_WEIGHT_G + PACKAGING_WEIGHT_G);
  const isTelangana = state === 'Telangana';
  
  let baseRate = 0;
  
  if (totalWeight <= 500) {
    baseRate = isTelangana ? 65 : 70;
  } else if (totalWeight <= 1000) {
    baseRate = isTelangana ? 91 : 106;
  } else if (totalWeight <= 1500) {
    baseRate = isTelangana ? 117 : 142;
  } else if (totalWeight <= 2000) {
    baseRate = isTelangana ? 160 : 198;
  } else if (totalWeight <= 3000) {
    baseRate = isTelangana ? 219 : 277;
  } else if (totalWeight <= 4000) {
    baseRate = isTelangana ? 268 : 344;
  } else if (totalWeight <= 5000) {
    baseRate = isTelangana ? 324 : 420;
  } else {
    // Over 5kg logic (base price for 5kg + extra per additional kg)
    const extraKg = Math.ceil((totalWeight - 5000) / 1000);
    baseRate = isTelangana ? (324 + extraKg * 50) : (420 + extraKg * 70);
  }

  // Add 18% GST and round to nearest integer
  const finalRate = Math.round(baseRate * 1.18);
  return finalRate;
}
