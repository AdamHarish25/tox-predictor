import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { symbol } = await request.json()

    if (!symbol) {
      return NextResponse.json({ error: "Symbol is required" }, { status: 400 })
    }

    // In a real implementation, this would call your Python Random Forest service
    // For now, we'll simulate the response based on your Python script output format
    const mockPrediction = await simulateRandomForestPrediction(symbol)

    return NextResponse.json(mockPrediction)
  } catch (error) {
    console.error("Random Forest API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function simulateRandomForestPrediction(symbol: string) {
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

    // Simulate Random Forest prediction (in real app, this would call your Python service)
    const prediction = currentPrice * (1 + (Math.random() - 0.4) * 0.06) // Simulate small change
    const predictionChangePercent = ((prediction - currentPrice) / currentPrice) * 100

    // Simulate Random Forest specific metrics
    const standardDeviation = currentPrice * 0.02 * (0.5 + Math.random()) // 1-3% of price
    const coefficientOfVariation = (standardDeviation / Math.abs(prediction)) * 100
    const intervalWidth = standardDeviation * 1.96 // 95% confidence interval
    const lower = prediction - intervalWidth
    const upper = prediction + intervalWidth

    // Simulate model metrics (Random Forest typically performs better)
    const rSquared = 0.91 + Math.random() * 0.07 // 0.91-0.98
    const mse = 1.5 + Math.random() * 2.0 // 1.5-3.5

    // Determine confidence based on CV
    let confidence: string
    if (coefficientOfVariation <= 5) {
      confidence = "Very High"
    } else if (coefficientOfVariation <= 15) {
      confidence = "High"
    } else {
      confidence = "Medium"
    }

    return {
      symbol,
      lastActualPrice: currentPrice,
      lastActualDate: latestData.datetime,
      prediction,
      predictionDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      priceChangePercent,
      predictionChangePercent,
      confidence,
      rSquared,
      mse,
      riskAssessment:
        coefficientOfVariation <= 5
          ? "Very high confidence: Excellent agreement among model components with low relative volatility."
          : coefficientOfVariation <= 15
            ? "High confidence: Good agreement among model components with moderate relative volatility."
            : "Medium confidence: Some disagreement among model components or higher relative volatility.",
      modelType: "random_forest" as const,
      predictionInterval: {
        lower,
        upper,
        width: ((upper - lower) / prediction) * 100,
      },
      coefficientOfVariation,
      standardDeviation,
    }
  } catch (error) {
    console.error("Error in Random Forest simulation:", error)
    throw error
  }
}
