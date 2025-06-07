import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { symbol } = await request.json()

    if (!symbol) {
      return NextResponse.json({ error: "Symbol is required" }, { status: 400 })
    }

    // In a real implementation, this would call your Python Linear Regression service
    // For now, we'll simulate the response based on your Python script output format
    const mockPrediction = await simulateLinearRegressionPrediction(symbol)

    return NextResponse.json(mockPrediction)
  } catch (error) {
    console.error("Linear Regression API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function simulateLinearRegressionPrediction(symbol: string) {
  // Fetch real current price from Twelve Data API
  const API_KEY = process.env.NEXT_PUBLIC_TWELVE_DATA_API_KEY
  const url = `https://api.twelvedata.com/time_series?symbol=${symbol}&interval=1day&outputsize=2&apikey=${API_KEY}&format=JSON`

  try {
    const response = await fetch(url)
    const data = await response.json()

    if (!data.values || data.values.length === 0) {
      throw new Error("No data available")
    }

    const latestData = data.values[0]
    const previousData = data.values[1]
    const currentPrice = Number.parseFloat(latestData.close)
    const previousPrice = Number.parseFloat(previousData.close)

    // Calculate price change
    const priceChangePercent = ((currentPrice - previousPrice) / previousPrice) * 100

    // Simulate Linear Regression prediction (in real app, this would call your Python service)
    const prediction = currentPrice * (1 + (Math.random() - 0.4) * 0.05) // Simulate small change
    const predictionChangePercent = ((prediction - currentPrice) / currentPrice) * 100

    // Simulate model metrics
    const rSquared = 0.87 + Math.random() * 0.08 // 0.87-0.95
    const mse = 2.0 + Math.random() * 3.0 // 2.0-5.0

    return {
      symbol,
      lastActualPrice: currentPrice,
      lastActualDate: latestData.datetime,
      prediction,
      predictionDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      priceChangePercent,
      predictionChangePercent,
      confidence: rSquared > 0.9 ? "High" : rSquared > 0.8 ? "Medium" : "Low",
      rSquared,
      mse,
      riskAssessment:
        rSquared > 0.9
          ? "High confidence: Model shows strong predictive power with good R² score."
          : rSquared > 0.8
            ? "Medium confidence: Model shows moderate predictive power."
            : "Low confidence: Model performance is limited, treat prediction with caution.",
      modelType: "linear_regression" as const,
    }
  } catch (error) {
    console.error("Error in Linear Regression simulation:", error)
    throw error
  }
}
