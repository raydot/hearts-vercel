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
    <Card className="absolute top-4 right-4 w-64 bg-white/95 backdrop-blur shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Scores</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {scores.map((score, index) => (
          <div
            key={index}
            className={cn(
              "flex items-center justify-between p-2 rounded-md transition-colors",
              currentPlayerIndex === index && "bg-yellow-100 ring-2 ring-yellow-400"
            )}
          >
            <span className="font-medium">{playerNames[index]}</span>
            <Badge variant={score >= 100 ? "destructive" : "secondary"}>
              {score}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export { ScorePanel }
