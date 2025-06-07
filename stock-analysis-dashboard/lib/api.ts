// API functions for fetching stock data from Twelve Data

// You should replace this with your own API key or use environment variables
const API_KEY = process.env.NEXT_PUBLIC_TWELVE_DATA_API_KEY || "57a8d494900f4f0a86d2a1494b66ff4d"
const BASE_URL = "https://api.twelvedata.com/time_series"

export interface StockData {
  datetime: string
  open: string
  high: string
  low: string
  close: string
  volume: string
}

export interface StockDataResponse {
  meta: {
    symbol: string
    interval: string
    currency: string
    exchange_timezone: string
    exchange: string
    type: string
  }
  values: StockData[]
  status: string
}

export interface ProcessedStockData {
  date: string
  close: number
  prediction: number | null
}

/**
 * Fetch stock data from Twelve Data API
 */
export async function fetchStockData(
  symbol: string,
  interval = "1month",
  outputsize = 12,
): Promise<ProcessedStockData[]> {
  try {
    const url = `${BASE_URL}?symbol=${symbol}&interval=${interval}&outputsize=${outputsize}&apikey=${API_KEY}&format=JSON`

    console.log(`Fetching data from: ${url}`)

    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`)
    }

    const data: StockDataResponse = await response.json()

    if (!data.values || data.status === "error") {
      throw new Error(data.status || "Failed to fetch stock data")
    }

    // Process the data into the format our chart expects
    const processedData: ProcessedStockData[] = data.values.map((item) => ({
      date: formatDate(item.datetime),
      close: Number.parseFloat(item.close),
      prediction: null,
    }))

    // Sort by date (oldest to newest)
    processedData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    // Add prediction for the next period
    const lastPrice = processedData[processedData.length - 1].close
    const prediction = calculatePrediction(processedData, symbol)

    processedData.push({
      date: "Next Month (Pred)",
      close: null,
      prediction: prediction,
    })

    return processedData
  } catch (error) {
    console.error("Error fetching stock data:", error)
    throw error
  }
}

/**
 * Simple prediction calculation
 * In a real app, this would use the ML models from your Python script
 */
function calculatePrediction(data: ProcessedStockData[], symbol: string): number {
  // Get the last 4 months of data
  const recentData = data.slice(-4)

  // Calculate the average monthly change
  let totalChange = 0
  for (let i = 1; i < recentData.length; i++) {
    const percentChange = (recentData[i].close - recentData[i - 1].close) / recentData[i - 1].close
    totalChange += percentChange
  }

  const avgChange = totalChange / (recentData.length - 1)

  // Apply the average change to the last price
  const lastPrice = recentData[recentData.length - 1].close
  const prediction = lastPrice * (1 + avgChange)

  // Add some randomness based on the symbol to simulate different models
  const randomFactor = symbol === "AAPL" ? 1.005 : 1.01

  return Number.parseFloat((prediction * randomFactor).toFixed(2))
}

/**
 * Format date from API to a more readable format
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const month = date.toLocaleString("default", { month: "short" })
  const year = date.getFullYear()
  return `${month} ${year}`
}
