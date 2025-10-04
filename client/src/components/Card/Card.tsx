import React from "react"
import { Suit, Rank } from "@/types"
import { PlayingCard } from "@/components/ui/playing-card"

interface CardProps {
  suit: Suit
  rank: Rank
  onClick?: () => void
  onMouseEnter?: () => void
  onMouseLeave?: () => void
}

const Card: React.FC<CardProps> = ({ suit, rank, onClick, onMouseEnter, onMouseLeave }) => {
  return (
    <PlayingCard
      suit={suit}
      rank={rank}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      data-testid="card"
      role="button"
    />
  )
}

export default Card
