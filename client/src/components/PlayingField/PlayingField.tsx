import React from "react"
import PlayerHand from "@/components/PlayerHand/PlayerHand"
import Player from "@/components/Player/Player"
import { Card } from "@/types"

import "./PlayingField.css"

interface PlayingFieldProps {
  playerHands: Card[][]
  currentTurn: number
  onCardClick: (card: Card) => void
}

const PlayingField: React.FC<PlayingFieldProps> = ({
  playerHands,
  currentTurn,
  onCardClick
}) => {
  // Make sure the player has a hand
  const playerHand = playerHands[0] || []

  return (
    <div className="playingField">
      <div className={`player top ${currentTurn === 1 ? "active" : ""}`}>
        <Player name="Computer 1" isComputer={true} position="top" />
        {playerHands[1] && (
          <div className="computer-hand">
            <div className="card-count">{playerHands[1].length} cards</div>
          </div>
        )}
      </div>
      <div className={`player left ${currentTurn === 2 ? "active" : ""}`}>
        <Player name="Computer 2" isComputer={true} position="left" />
        {playerHands[2] && (
          <div className="computer-hand">
            <div className="card-count">{playerHands[2].length} cards</div>
          </div>
        )}
      </div>
      <div className={`player right ${currentTurn === 3 ? "active" : ""}`}>
        <Player name="Computer 3" isComputer={true} position="right" />
        {playerHands[3] && (
          <div className="computer-hand">
            <div className="card-count">{playerHands[3].length} cards</div>
          </div>
        )}
      </div>
      <div className={`human-player ${currentTurn === 0 ? "active" : ""}`}>
        <Player name="You" isComputer={false} position="bottom" />
        <PlayerHand playerHand={playerHand} onCardClick={onCardClick} />
      </div>
    </div>
  )
}

export default PlayingField
