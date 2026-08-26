export const BOOK_WEIGHT_G = 182;
export const PACKAGING_WEIGHT_G = 50;

/**
 * Calculates the shipping cost based on the state and quantity of books.
 * Uses India Post Regular Parcel tariffs and adds 18% GST.
 */
export function calculateShipping(state: string, quantity: number): number {
  if (!state || quantity < 1) return 0;

  const totalWeight = quantity * (BOOK_WEIGHT_G + PACKAGING_WEIGHT_G);
  const isAndhraPradesh = state === 'Andhra Pradesh';
  
  let baseRate = 0;
  
  // Since 1 book is 232g, the minimum base rate is always the 201g-500g slab.
  if (totalWeight <= 500) {
    baseRate = isAndhraPradesh ? 50 : 60;
  } else {
    // Base rate for the first 500g
    baseRate = isAndhraPradesh ? 50 : 60;
    
    // Additional 500g (or part thereof)
    const extraWeight = totalWeight - 500;
    const extraChunks = Math.ceil(extraWeight / 500);
    
    const extraRatePerChunk = isAndhraPradesh ? 15 : 30;
    baseRate += (extraChunks * extraRatePerChunk);
  }

  // Add 18% GST and round to nearest integer
  const finalRate = Math.round(baseRate * 1.18);
  return finalRate;
}
