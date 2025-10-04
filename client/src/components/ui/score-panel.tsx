import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface ScorePanelProps {
  scores: number[]
  playerNames: string[]
  currentPlayerIndex: number
}

const ScorePanel: React.FC<ScorePanelProps> = ({
  scores,
  playerNames,
  currentPlayerIndex,
}) => {
  return (
    <Card className="absolute top-2 right-2 w-40 bg-white/95 backdrop-blur shadow-lg z-50">
      <CardHeader className="px-2 pt-1.5 pb-0.5">
        <CardTitle className="text-sm font-semibold">Scores</CardTitle>
      </CardHeader>
      <CardContent className="px-2 pb-1.5 pt-0 space-y-0.5">
        {scores.map((score, index) => (
          <div
            key={index}
            className={cn(
              "flex items-center justify-between px-1.5 py-0.5 rounded text-xs transition-colors",
              currentPlayerIndex === index && "bg-yellow-100 ring-1 ring-yellow-400"
            )}
          >
            <span className="font-medium text-xs">{playerNames[index]}</span>
            <Badge variant={score >= 100 ? "destructive" : "secondary"} className="text-xs px-1.5 py-0">
              {score}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export { ScorePanel }
