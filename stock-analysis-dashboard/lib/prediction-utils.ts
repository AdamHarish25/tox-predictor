import type { ProcessedStockData } from "./api"

/**
 * Calculate the accuracy of previous predictions
 * In a real app, this would compare past predictions with actual results
 */
export function calculateAccuracy(data: ProcessedStockData[]): number {
  // This is a placeholder function that would normally compare
  // previous predictions with actual results
  return 87.5
}

/**
 * Calculate confidence level based on model metrics
 */
export function calculateConfidence(accuracy: number): string {
  if (accuracy >= 90) return "Very High"
  if (accuracy >= 85) return "High"
  if (accuracy >= 75) return "Medium"
  if (accuracy >= 65) return "Low"
  return "Very Low"
}
