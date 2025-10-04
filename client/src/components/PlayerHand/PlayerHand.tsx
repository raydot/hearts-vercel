import React from "react"
import { Card as CardType } from "@/types"
import Card from "@/components/Card/Card"
import { cn } from "@/lib/utils"

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
  // Debug: Log player hand
  console.log('PlayerHand: Rendering with', playerHand.length, 'cards');
  
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

  const handleCardClick = (card: CardType) => {
    if (isCardPlayable && isCardPlayable(card)) {
      onCardClick(card);
    }
  };

  return (
    <div 
      className="flex flex-row justify-center items-end p-5 min-h-[180px] relative [perspective:1000px]" 
      data-testid="card-container"
    >
      {sortedPlayerHand.map((card, index) => {
        const isPlayable = isCardPlayable(card);
        const rotation = -10 + (index * (20 / Math.max(sortedPlayerHand.length - 1, 1)));
        
        return (
          <div
            key={`${card.suit}-${card.rank}`}
            className={cn(
              "relative transition-transform duration-300 ease-in-out",
              "hover:!-translate-y-4 hover:!scale-105 hover:!z-[100]",
              !isPlayable && "opacity-70 cursor-not-allowed hover:!-translate-y-1"
            )}
            data-testid="card-wrapper"
            style={{ 
              marginLeft: index > 0 ? '-30px' : '0', 
              zIndex: index + 1,
              transform: `rotate(${rotation}deg)`,
              transformOrigin: 'bottom center'
            }}
          >
            <Card
              suit={card.suit}
              rank={card.rank}
              onClick={() => handleCardClick(card)}
            />
          </div>
        );
      })}
    </div>
  );
};

export default PlayerHand;