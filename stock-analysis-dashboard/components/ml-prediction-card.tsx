import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { ArrowDown, ArrowUp, type LucideIcon } from "lucide-react"

interface MLPredictionCardProps {
  title: string
  value: string
  change: string
  positive: boolean
  noChange?: boolean
  icon?: LucideIcon
}

export default function MLPredictionCard({
  title,
  value,
  change,
  positive,
  noChange = false,
  icon: Icon,
}: MLPredictionCardProps) {
  return (
    <Card className="border-[#2FA5D4]/20 bg-[#2A2B2B]">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {Icon && <Icon className="h-4 w-4 text-[#2FA5D4]" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-white">{value}</div>
        {!noChange && (
          <p className={`mt-1 flex items-center text-xs ${positive ? "text-green-500" : "text-red-500"}`}>
            {positive ? <ArrowUp className="mr-1 h-4 w-4" /> : <ArrowDown className="mr-1 h-4 w-4" />}
            {change}
          </p>
        )}
        {noChange && change && <p className="mt-1 text-xs text-muted-foreground">{change}</p>}
      </CardContent>
    </Card>
  )
}
