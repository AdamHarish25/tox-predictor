"use client"

import { useState } from "react"
// Use relative paths instead of @/ alias
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import StockChart from "../components/stock-chart"
import PredictionCard from "../components/prediction-card"
import { appleData, nvidiaData } from "../lib/stock-data"
import { Button } from "../components/ui/button"
import { BarChart3, LineChart } from "lucide-react"
import Header from "../components/header"

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

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
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <PredictionCard title="AAPL Last Price" value="$206.86" change="-0.92%" positive={false} />
                <PredictionCard title="AAPL Predicted" value="$210.58" change="+1.8%" positive={true} />
                <PredictionCard title="Accuracy" value="87.5%" change="+0.5%" positive={true} />
                <PredictionCard title="Confidence" value="High" change="" positive={true} noChange={true} />
              </div>

              <Card className="border-[#2FA5D4]/20 bg-[#2A2B2B]">
                <CardHeader>
                  <CardTitle className="text-[#2FA5D4]">AAPL Stock Price Prediction</CardTitle>
                  <CardDescription>Linear Regression Model Analysis</CardDescription>
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
                        The Linear Regression model shows a strong positive trend for AAPL stock, with a predicted
                        increase of 2.2% for the next period. The model has a high R² score of 0.92, indicating good
                        fit.
                      </p>
                      <p className="text-sm">
                        Key factors influencing the prediction include consistent upward momentum in recent months and
                        stable moving averages. The model suggests a continued bullish outlook for AAPL in the short
                        term.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="random-forest" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <PredictionCard title="NVDA Last Price" value="$134.38" change="-0.88%" positive={false} />
                <PredictionCard title="NVDA Predicted" value="$138.95" change="+3.4%" positive={true} />
                <PredictionCard title="Accuracy" value="91.2%" change="+1.2%" positive={true} />
                <PredictionCard title="Confidence" value="Very High" change="" positive={true} noChange={true} />
              </div>

              <Card className="border-[#2FA5D4]/20 bg-[#2A2B2B]">
                <CardHeader>
                  <CardTitle className="text-[#2FA5D4]">NVDA Stock Price Prediction</CardTitle>
                  <CardDescription>Random Forest Model Analysis</CardDescription>
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
                        The Random Forest model predicts a continued strong performance for NVDA stock, with a projected
                        increase of 3.4% for the next period. The model demonstrates excellent accuracy with an R² score
                        of 0.95.
                      </p>
                      <p className="text-sm">
                        The model leverages multiple features including moving averages (5-day and 10-day) to capture
                        both short-term momentum and longer-term trends. Feature importance analysis shows closing price
                        and 5-day MA as the most significant predictors.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
