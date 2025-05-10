import React from "react"
import { Card as CardType } from "@/types"
import Card from "@/components/Card/Card"

import "./PlayerHand.css"

interface PlayerHandProps {
  playerHand: CardType[]
  onCardClick: (card: CardType) => void
}

const PlayerHand: React.FC<PlayerHandProps> = ({ playerHand, onCardClick }) => {
  // Sort the hand by suit and rank
  const sortedPlayerHand = [...playerHand].sort((a, b) => {
    const suitOrder: Record<string, number> = {
      'clubs': 0,
      'diamonds': 1,
      'spades': 2,
      'hearts': 3
    };
    
    if (a.suit !== b.suit) {
      return suitOrder[a.suit] - suitOrder[b.suit];
    }
    
    const rankOrder: Record<string, number> = {
      '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
      '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14
    };
    
    return rankOrder[a.rank] - rankOrder[b.rank];
  });

  return (
    <div className="card-container">
      {sortedPlayerHand.map((card, index) => (
        <Card
          key={index}
          suit={card.suit}
          rank={card.rank}
          onClick={() => onCardClick(card)}
        />
      ))}
    </div>
  );
};

export default PlayerHand;