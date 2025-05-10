import React from "react"
import { Suit, Rank } from "@/types"
import "./Card.css"

interface CardProps {
  suit: Suit
  rank: Rank
  onClick?: () => void
}

const Card: React.FC<CardProps> = ({ suit, rank, onClick }) => {
  const getSuitSymbol = (suit: Suit): string => {
    switch (suit) {
      case "hearts":
        return "♥";
      case "diamonds":
        return "♦";
      case "clubs":
        return "♣";
      case "spades":
        return "♠";
      default:
        return "";
    }
  }

  const getSuitColor = (suit: Suit): string => {
    return suit === "hearts" || suit === "diamonds" ? "red" : "black"
  }

  const suitSymbol = getSuitSymbol(suit)
  const color = getSuitColor(suit)

  return (
    <div className={`card ${color}`} onClick={onClick}>
      <div className="card-corner top-left">
        <div className="card-rank">{rank}</div>
        <div className="card-suit">{suitSymbol}</div>
      </div>
      <div className="card-center">{suitSymbol}</div>
      <div className="card-corner bottom-right">
        <div className="card-rank">{rank}</div>
        <div className="card-suit">{suitSymbol}</div>
      </div>
    </div>
  )
}

export default Card
