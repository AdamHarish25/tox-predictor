"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import StockChart from "../components/stock-chart"
import MLPredictionCard from "../components/ml-prediction-card"
import { Button } from "../components/ui/button"
import { BarChart3, LineChart, RefreshCw, TrendingUp, TrendingDown } from "lucide-react"
import Header from "../components/header"
import {
  fetchLinearRegressionPrediction,
  fetchRandomForestPrediction,
  fetchHistoricalStockData,
  type MLPredictionResult,
  type StockDataPoint,
} from "../lib/ml-api"
import { mockAppleData, mockNvidiaData } from "../lib/mock-data"

export default function MLDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [appleLinearData, setAppleLinearData] = useState<MLPredictionResult | null>(null)
  const [appleRandomForestData, setAppleRandomForestData] = useState<MLPredictionResult | null>(null)
  const [nvidiaLinearData, setNvidiaLinearData] = useState<MLPredictionResult | null>(null)
  const [nvidiaRandomForestData, setNvidiaRandomForestData] = useState<MLPredictionResult | null>(null)
  const [appleChartData, setAppleChartData] = useState<StockDataPoint[]>(mockAppleData)
  const [nvidiaChartData, setNvidiaChartData] = useState<StockDataPoint[]>(mockNvidiaData)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  // Fetch data on component mount
  useEffect(() => {
    fetchAllData()

    // Set up daily refresh (24 hours)
    const intervalId = setInterval(
      () => {
        fetchAllData()
      },
      24 * 60 * 60 * 1000,
    ) // 24 hours in milliseconds

    return () => clearInterval(intervalId)
  }, [])

  const fetchAllData = async () => {
    setLoading(true)
    setError(null)

    try {
      // Fetch ML predictions and historical data in parallel
      const [appleLinear, appleRF, nvidiaLinear, nvidiaRF, appleChart, nvidiaChart] = await Promise.all([
        fetchLinearRegressionPrediction("AAPL"),
        fetchRandomForestPrediction("AAPL"),
        fetchLinearRegressionPrediction("NVDA"),
        fetchRandomForestPrediction("NVDA"),
        fetchHistoricalStockData("AAPL").catch(() => []),
        fetchHistoricalStockData("NVDA").catch(() => []),
      ])

      setAppleLinearData(appleLinear)
      setAppleRandomForestData(appleRF)
      setNvidiaLinearData(nvidiaLinear)
      setNvidiaRandomForestData(nvidiaRF)

      // Add predictions to chart data
      if (appleChart && appleChart.length > 0 && appleLinear) {
        const chartWithPrediction = [...appleChart]
        // Add prediction point
        chartWithPrediction.push({
          date: "Next Day",
          close: null,
          prediction: appleLinear.prediction,
        })
        setAppleChartData(chartWithPrediction)
      }

      if (nvidiaChart && nvidiaChart.length > 0 && nvidiaRF) {
        const chartWithPrediction = [...nvidiaChart]
        // Add prediction point
        chartWithPrediction.push({
          date: "Next Day",
          close: null,
          prediction: nvidiaRF.prediction,
        })
        setNvidiaChartData(chartWithPrediction)
      }

      setLastUpdated(new Date())
    } catch (err) {
      setError("Failed to fetch ML predictions. Using mock data instead.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    fetchAllData()
  }

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
              <h2 className="mb-2 text-lg font-semibold text-[#2FA5D4]">ML Models</h2>
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
                <p className="text-sm text-muted-foreground">
                  Last updated: {lastUpdated.toLocaleString()} (Updates daily)
                </p>
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
              {loading && !appleLinearData ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-pulse text-[#2FA5D4]">Loading Linear Regression predictions...</div>
                </div>
              ) : (
                <>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <MLPredictionCard
                      title="AAPL Current Price"
                      value={`$${appleLinearData?.lastActualPrice?.toFixed(2) || "203.92"}`}
                      change={`${appleLinearData?.priceChangePercent?.toFixed(2) || "1.64"}%`}
                      positive={(appleLinearData?.priceChangePercent || 1.64) >= 0}
                      icon={appleLinearData?.priceChangePercent >= 0 ? TrendingUp : TrendingDown}
                    />
                    <MLPredictionCard
                      title="AAPL Predicted"
                      value={`$${appleLinearData?.prediction?.toFixed(2) || "201.17"}`}
                      change={`${appleLinearData?.predictionChangePercent?.toFixed(2) || "-1.35"}%`}
                      positive={(appleLinearData?.predictionChangePercent || -1.35) >= 0}
                      icon={appleLinearData?.predictionChangePercent >= 0 ? TrendingUp : TrendingDown}
                    />
                    <MLPredictionCard
                      title="Model Accuracy"
                      value={`${((appleLinearData?.rSquared || 0.944) * 100).toFixed(1)}%`}
                      change="R² Score"
                      positive={true}
                      noChange={true}
                    />
                    <MLPredictionCard
                      title="Confidence"
                      value={appleLinearData?.confidence || "High"}
                      change=""
                      positive={true}
                      noChange={true}
                    />
                  </div>

                  <Card className="border-[#2FA5D4]/20 bg-[#2A2B2B]">
                    <CardHeader>
                      <CardTitle className="text-[#2FA5D4]">AAPL Stock Price Prediction</CardTitle>
                      <CardDescription>Linear Regression Model Analysis (Daily Updates)</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <StockChart data={appleChartData} dataKey="close" predictionKey="prediction" />
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
                            <span className="font-medium">
                              {((appleLinearData?.rSquared || 0.944) * 100).toFixed(1)}%
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Mean Squared Error</span>
                            <span className="font-medium">{appleLinearData?.mse?.toFixed(2) || "2.34"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Prediction Date</span>
                            <span className="font-medium">
                              {appleLinearData?.predictionDate || new Date().toISOString().split("T")[0]}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Data Date</span>
                            <span className="font-medium">
                              {appleLinearData?.lastActualDate ||
                                new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split("T")[0]}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-[#2FA5D4]/20 bg-[#2A2B2B]">
                      <CardHeader>
                        <CardTitle className="text-[#2FA5D4]">Risk Assessment</CardTitle>
                        <CardDescription>Linear Regression Analysis</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <p className="text-sm">
                            {appleLinearData?.riskAssessment ||
                              "High confidence: Model shows strong predictive power with good R² score."}
                          </p>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Confidence Level</span>
                            <span className="font-medium">{appleLinearData?.confidence || "High"}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="random-forest" className="space-y-6">
              {loading && !nvidiaRandomForestData ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-pulse text-[#2FA5D4]">Loading Random Forest predictions...</div>
                </div>
              ) : (
                <>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <MLPredictionCard
                      title="NVDA Current Price"
                      value={`$${nvidiaRandomForestData?.lastActualPrice?.toFixed(2) || "141.72"}`}
                      change={`${nvidiaRandomForestData?.priceChangePercent?.toFixed(2) || "1.24"}%`}
                      positive={(nvidiaRandomForestData?.priceChangePercent || 1.24) >= 0}
                      icon={nvidiaRandomForestData?.priceChangePercent >= 0 ? TrendingUp : TrendingDown}
                    />
                    <MLPredictionCard
                      title="NVDA Predicted"
                      value={`$${nvidiaRandomForestData?.prediction?.toFixed(2) || "146.26"}`}
                      change={`${nvidiaRandomForestData?.predictionChangePercent?.toFixed(2) || "3.21"}%`}
                      positive={(nvidiaRandomForestData?.predictionChangePercent || 3.21) >= 0}
                      icon={nvidiaRandomForestData?.predictionChangePercent >= 0 ? TrendingUp : TrendingDown}
                    />
                    <MLPredictionCard
                      title="Model Accuracy"
                      value={`${((nvidiaRandomForestData?.rSquared || 0.95) * 100).toFixed(1)}%`}
                      change="R² Score"
                      positive={true}
                      noChange={true}
                    />
                    <MLPredictionCard
                      title="Confidence"
                      value={nvidiaRandomForestData?.confidence || "Very High"}
                      change={`CV: ${nvidiaRandomForestData?.coefficientOfVariation?.toFixed(1) || "2.7"}%`}
                      positive={true}
                      noChange={true}
                    />
                  </div>

                  <Card className="border-[#2FA5D4]/20 bg-[#2A2B2B]">
                    <CardHeader>
                      <CardTitle className="text-[#2FA5D4]">NVDA Stock Price Prediction</CardTitle>
                      <CardDescription>Random Forest Model Analysis (Daily Updates)</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <StockChart data={nvidiaChartData} dataKey="close" predictionKey="prediction" />
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
                            <span className="font-medium">
                              {((nvidiaRandomForestData?.rSquared || 0.95) * 100).toFixed(1)}%
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Mean Squared Error</span>
                            <span className="font-medium">{nvidiaRandomForestData?.mse?.toFixed(2) || "1.87"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Coefficient of Variation</span>
                            <span className="font-medium">
                              {nvidiaRandomForestData?.coefficientOfVariation?.toFixed(2) || "2.7"}%
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Standard Deviation</span>
                            <span className="font-medium">
                              ${nvidiaRandomForestData?.standardDeviation?.toFixed(2) || "3.95"}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-[#2FA5D4]/20 bg-[#2A2B2B]">
                      <CardHeader>
                        <CardTitle className="text-[#2FA5D4]">Prediction Interval</CardTitle>
                        <CardDescription>Random Forest Confidence Interval</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Lower Bound</span>
                            <span className="font-medium">
                              ${nvidiaRandomForestData?.predictionInterval?.lower?.toFixed(2) || "138.48"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Upper Bound</span>
                            <span className="font-medium">
                              ${nvidiaRandomForestData?.predictionInterval?.upper?.toFixed(2) || "154.04"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Interval Width</span>
                            <span className="font-medium">
                              {nvidiaRandomForestData?.predictionInterval?.width?.toFixed(1) || "10.6"}%
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {nvidiaRandomForestData?.riskAssessment ||
                              "Very high confidence: Excellent agreement among model components with low relative volatility."}
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
