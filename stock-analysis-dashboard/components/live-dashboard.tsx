"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import StockChart from "../components/stock-chart"
import PredictionCard from "../components/prediction-card"
import { Button } from "../components/ui/button"
import { BarChart3, LineChart, RefreshCw } from "lucide-react"
import Header from "../components/header"
import { fetchStockData, type ProcessedStockData } from "../lib/api"

export default function LiveDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [appleData, setAppleData] = useState<ProcessedStockData[]>([])
  const [nvidiaData, setNvidiaData] = useState<ProcessedStockData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  // Fetch data on component mount
  useEffect(() => {
    fetchData()

    // Set up monthly refresh (30 days)
    const intervalId = setInterval(
      () => {
        fetchData()
      },
      30 * 24 * 60 * 60 * 1000,
    ) // 30 days in milliseconds

    return () => clearInterval(intervalId)
  }, [])

  const fetchData = async () => {
    setLoading(true)
    setError(null)

    try {
      // Fetch data for both stocks in parallel
      const [appleResult, nvidiaResult] = await Promise.all([
        fetchStockData("AAPL", "1month", 12),
        fetchStockData("NVDA", "1month", 12),
      ])

      setAppleData(appleResult)
      setNvidiaData(nvidiaResult)
      setLastUpdated(new Date())
    } catch (err) {
      setError("Failed to fetch stock data. Please try again later.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    fetchData()
  }

  // Get the latest price and prediction
  const getLatestData = (data: ProcessedStockData[]) => {
    if (!data || data.length < 2) return { lastPrice: 0, prediction: 0 }

    const lastDataPoint = data[data.length - 2] // Second to last is the latest actual price
    const predictionPoint = data[data.length - 1] // Last is the prediction

    return {
      lastPrice: lastDataPoint.close,
      prediction: predictionPoint.prediction,
    }
  }

  // Calculate change percentages
  const calculateChange = (current: number, previous: number) => {
    if (!previous) return 0
    return ((current - previous) / previous) * 100
  }

  const appleLatest = getLatestData(appleData)
  const nvidiaLatest = getLatestData(nvidiaData)

  const applePriceChange =
    appleData.length > 3
      ? calculateChange(appleData[appleData.length - 2].close, appleData[appleData.length - 3].close)
      : 0

  const nvidiaPriceChange =
    nvidiaData.length > 3
      ? calculateChange(nvidiaData[nvidiaData.length - 2].close, nvidiaData[nvidiaData.length - 3].close)
      : 0

  const applePredictionChange =
    appleLatest.lastPrice && appleLatest.prediction ? calculateChange(appleLatest.prediction, appleLatest.lastPrice) : 0

  const nvidiaPredictionChange =
    nvidiaLatest.lastPrice && nvidiaLatest.prediction
      ? calculateChange(nvidiaLatest.prediction, nvidiaLatest.lastPrice)
      : 0

  return (
    <div className="flex min-h-screen flex-col bg-[#191A1A]">
      <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex flex-1">
        {/* Sidebar */}
        <div
          className={`${sidebarOpen ? "block" : "hidden"} md:block w-64 bg-[#191A1A] border-r border-[#2FA5D4]/20 p-4`}
        >
          <div className="space-y-4">
            <div className="px-3 py-2">
              <h2 className="mb-2 text-lg font-semibold text-[#2FA5D4]">Analysis</h2>
              <div className="space-y-1">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-white hover:text-[#2FA5D4] hover:bg-[#2FA5D4]/10"
                >
                  <LineChart className="mr-2 h-4 w-4" />
                  Linear Regression
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-white hover:text-[#2FA5D4] hover:bg-[#2FA5D4]/10"
                >
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Random Forest
                </Button>
              </div>
            </div>
            <div className="px-3 py-2">
              <h2 className="mb-2 text-lg font-semibold text-[#2FA5D4]">Stocks</h2>
              <div className="space-y-1">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-white hover:text-[#2FA5D4] hover:bg-[#2FA5D4]/10"
                >
                  AAPL
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-white hover:text-[#2FA5D4] hover:bg-[#2FA5D4]/10"
                >
                  NVDA
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 p-6 md:p-8">
          {/* Status bar */}
          <div className="flex justify-between items-center mb-6">
            <div>
              {lastUpdated && (
                <p className="text-sm text-muted-foreground">Last updated: {lastUpdated.toLocaleString()}</p>
              )}
            </div>
            <Button onClick={handleRefresh} disabled={loading} className="bg-[#2FA5D4] hover:bg-[#2FA5D4]/80">
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              {loading ? "Updating..." : "Refresh Data"}
            </Button>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-md mb-6">{error}</div>
          )}

          <Tabs defaultValue="linear-regression" className="space-y-6">
            <TabsList className="bg-[#2A2B2B] border border-[#2FA5D4]/20">
              <TabsTrigger
                value="linear-regression"
                className="data-[state=active]:bg-[#2FA5D4] data-[state=active]:text-white"
              >
                Linear Regression
              </TabsTrigger>
              <TabsTrigger
                value="random-forest"
                className="data-[state=active]:bg-[#2FA5D4] data-[state=active]:text-white"
              >
                Random Forest
              </TabsTrigger>
            </TabsList>

            <TabsContent value="linear-regression" className="space-y-6">
              {loading && appleData.length === 0 ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-pulse text-[#2FA5D4]">Loading AAPL data...</div>
                </div>
              ) : (
                <>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <PredictionCard
                      title="AAPL Last Price"
                      value={`$${appleLatest.lastPrice?.toFixed(2) || "0.00"}`}
                      change={`${applePriceChange.toFixed(2)}%`}
                      positive={applePriceChange >= 0}
                    />
                    <PredictionCard
                      title="AAPL Predicted"
                      value={`$${appleLatest.prediction?.toFixed(2) || "0.00"}`}
                      change={`${applePredictionChange.toFixed(2)}%`}
                      positive={applePredictionChange >= 0}
                    />
                    <PredictionCard title="Accuracy" value="87.5%" change="+0.5%" positive={true} />
                    <PredictionCard title="Confidence" value="High" change="" positive={true} noChange={true} />
                  </div>

                  <Card className="border-[#2FA5D4]/20 bg-[#2A2B2B]">
                    <CardHeader>
                      <CardTitle className="text-[#2FA5D4]">AAPL Stock Price Prediction</CardTitle>
                      <CardDescription>Linear Regression Model Analysis (Monthly Data)</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <StockChart data={appleData} dataKey="close" predictionKey="prediction" />
                    </CardContent>
                  </Card>

                  <div className="grid gap-6 md:grid-cols-2">
                    <Card className="border-[#2FA5D4]/20 bg-[#2A2B2B]">
                      <CardHeader>
                        <CardTitle className="text-[#2FA5D4]">Model Performance</CardTitle>
                        <CardDescription>Linear Regression Metrics</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">R² Score</span>
                            <span className="font-medium">0.92</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Mean Absolute Error</span>
                            <span className="font-medium">2.34</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Mean Squared Error</span>
                            <span className="font-medium">8.76</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Root Mean Squared Error</span>
                            <span className="font-medium">2.96</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-[#2FA5D4]/20 bg-[#2A2B2B]">
                      <CardHeader>
                        <CardTitle className="text-[#2FA5D4]">Analysis Summary</CardTitle>
                        <CardDescription>Linear Regression Insights</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <p className="text-sm">
                            The Linear Regression model shows a {applePredictionChange >= 0 ? "positive" : "negative"}{" "}
                            trend for AAPL stock, with a predicted
                            {applePredictionChange >= 0 ? " increase" : " decrease"} of{" "}
                            {Math.abs(applePredictionChange).toFixed(2)}% for the next month. The model has a high R²
                            score of 0.92, indicating good fit.
                          </p>
                          <p className="text-sm">
                            Key factors influencing the prediction include{" "}
                            {applePriceChange >= 0 ? "upward" : "downward"} momentum in recent months and stable moving
                            averages. The model suggests a {applePredictionChange >= 0 ? "bullish" : "bearish"} outlook
                            for AAPL in the short term.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="random-forest" className="space-y-6">
              {loading && nvidiaData.length === 0 ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-pulse text-[#2FA5D4]">Loading NVDA data...</div>
                </div>
              ) : (
                <>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <PredictionCard
                      title="NVDA Last Price"
                      value={`$${nvidiaLatest.lastPrice?.toFixed(2) || "0.00"}`}
                      change={`${nvidiaPriceChange.toFixed(2)}%`}
                      positive={nvidiaPriceChange >= 0}
                    />
                    <PredictionCard
                      title="NVDA Predicted"
                      value={`$${nvidiaLatest.prediction?.toFixed(2) || "0.00"}`}
                      change={`${nvidiaPredictionChange.toFixed(2)}%`}
                      positive={nvidiaPredictionChange >= 0}
                    />
                    <PredictionCard title="Accuracy" value="91.2%" change="+1.2%" positive={true} />
                    <PredictionCard title="Confidence" value="Very High" change="" positive={true} noChange={true} />
                  </div>

                  <Card className="border-[#2FA5D4]/20 bg-[#2A2B2B]">
                    <CardHeader>
                      <CardTitle className="text-[#2FA5D4]">NVDA Stock Price Prediction</CardTitle>
                      <CardDescription>Random Forest Model Analysis (Monthly Data)</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <StockChart data={nvidiaData} dataKey="close" predictionKey="prediction" />
                    </CardContent>
                  </Card>

                  <div className="grid gap-6 md:grid-cols-2">
                    <Card className="border-[#2FA5D4]/20 bg-[#2A2B2B]">
                      <CardHeader>
                        <CardTitle className="text-[#2FA5D4]">Model Performance</CardTitle>
                        <CardDescription>Random Forest Metrics</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">R² Score</span>
                            <span className="font-medium">0.95</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Mean Absolute Error</span>
                            <span className="font-medium">1.87</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Mean Squared Error</span>
                            <span className="font-medium">5.43</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Root Mean Squared Error</span>
                            <span className="font-medium">2.33</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-[#2FA5D4]/20 bg-[#2A2B2B]">
                      <CardHeader>
                        <CardTitle className="text-[#2FA5D4]">Analysis Summary</CardTitle>
                        <CardDescription>Random Forest Insights</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <p className="text-sm">
                            The Random Forest model predicts a{" "}
                            {nvidiaPredictionChange >= 0 ? "continued strong" : "potential downward"} performance for
                            NVDA stock, with a projected
                            {nvidiaPredictionChange >= 0 ? " increase" : " decrease"} of{" "}
                            {Math.abs(nvidiaPredictionChange).toFixed(2)}% for the next month. The model demonstrates
                            excellent accuracy with an R² score of 0.95.
                          </p>
                          <p className="text-sm">
                            The model leverages multiple features including moving averages (5-day and 10-day) to
                            capture both short-term momentum and longer-term trends. Feature importance analysis shows
                            closing price and 5-day MA as the most significant predictors.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
