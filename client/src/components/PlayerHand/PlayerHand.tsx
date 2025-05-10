import React from "react"
import { Card as CardType } from "@/types"
import Card from "@/components/Card/Card"

import "./PlayerHand.css"

interface PlayerHandProps {
  playerHand: CardType[]
  onCardClick: (card: CardType) => void
  isCardPlayable?: (card: CardType) => boolean
}

const PlayerHand: React.FC<PlayerHandProps> = ({ 
  playerHand, 
  onCardClick, 
  isCardPlayable = () => true // Default all cards are playable if not specified
}) => {
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
    <div className="card-container fanned-cards" data-testid="card-container">
      {sortedPlayerHand.map((card, index) => {
        const playable = isCardPlayable(card);
        return (
          <div 
            key={index} 
            className={`card-wrapper ${playable ? 'playable' : 'not-playable'}`}
            style={{ 
              marginLeft: index > 0 ? '-30px' : '0', 
              zIndex: index + 1,
              transform: `rotate(${-10 + (index * (20 / Math.max(sortedPlayerHand.length - 1, 1)))}deg)`,
              transformOrigin: 'bottom center'
            }}
          >
            <Card
              suit={card.suit}
              rank={card.rank}
              onClick={() => playable ? onCardClick(card) : null}
            />
          </div>
        );
      })}
    </div>
  );
};

export default PlayerHand;