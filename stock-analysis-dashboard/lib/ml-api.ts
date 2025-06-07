// API functions for interfacing with the ML model services

export interface MLPredictionResult {
  symbol: string
  lastActualPrice: number
  lastActualDate: string
  prediction: number
  predictionDate: string
  priceChangePercent: number
  predictionChangePercent: number
  confidence: string
  rSquared: number
  mse: number
  riskAssessment: string
  modelType: "linear_regression" | "random_forest"
  // Random Forest specific fields
  predictionInterval?: {
    lower: number
    upper: number
    width: number
  }
  coefficientOfVariation?: number
  standardDeviation?: number
}

export interface StockDataPoint {
  date: string
  close: number
  prediction: number | null
}

/**
 * Fetch prediction from Linear Regression model API
 */
export async function fetchLinearRegressionPrediction(symbol: string): Promise<MLPredictionResult | null> {
  try {
    const response = await fetch("/api/ml/linear-regression", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ symbol }),
    })

    if (!response.ok) {
      throw new Error(`Linear Regression API failed with status ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error fetching Linear Regression prediction:", error)
    return null
  }
}

/**
 * Fetch prediction from Random Forest model API
 */
export async function fetchRandomForestPrediction(symbol: string): Promise<MLPredictionResult | null> {
  try {
    const response = await fetch("/api/ml/random-forest", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ symbol }),
    })

    if (!response.ok) {
      throw new Error(`Random Forest API failed with status ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error fetching Random Forest prediction:", error)
    return null
  }
}

/**
 * Fetch historical stock data for charts
 */
export async function fetchHistoricalStockData(symbol: string): Promise<StockDataPoint[]> {
  try {
    const API_KEY = process.env.NEXT_PUBLIC_TWELVE_DATA_API_KEY
    const url = `https://api.twelvedata.com/time_series?symbol=${symbol}&interval=1day&outputsize=30&apikey=${API_KEY}&format=JSON`

    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`)
    }

    const data = await response.json()
    if (!data.values || data.values.length === 0) {
      throw new Error("No data values in API response")
    }

    // Process the data
    const processedData: StockDataPoint[] = data.values.map((item: any) => ({
      date: formatDate(item.datetime),
      close: Number.parseFloat(item.close),
      prediction: null,
    }))

    // Sort by date (oldest to newest)
    processedData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    return processedData
  } catch (error) {
    console.error("Error fetching historical stock data:", error)
    // Return empty array instead of throwing to prevent breaking the UI
    return []
  }
}

/**
 * Format date from API to a more readable format
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const month = date.toLocaleString("default", { month: "short" })
  const day = date.getDate()
  return `${month} ${day}`
}
