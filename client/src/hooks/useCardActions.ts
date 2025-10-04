import { Card } from '@/types';
import { isCardPlayable } from '@/engine/gameEngine';
import { GameState } from './useGameReducer';

/**
 * Custom hook to provide card playing actions using reducer state
 */
export function useCardActions(gameState: GameState & { playCard: (playerIndex: number, card: Card) => void }) {
  // Use passed game state instead of creating new instance
  const {
    playerHands,
    currentTurn,
    gameOver,
    trickCards,
    heartsBroken,
    gamePhase,
    isProcessing,
    playCard
  } = gameState;
  
  // Determine if this is the first trick by checking if all players have 13 cards
  const isFirstTrickOfGame = playerHands.every(hand => hand.length === 13);
  
  // Create tricks array based on whether it's the first trick
  // If it's the first trick, all players have empty trick arrays
  // If not, we simulate that each player has at least one completed trick
  const dummyCard: Card = { suit: 'clubs', rank: '2' };
  const tricks: Card[][][] = isFirstTrickOfGame 
    ? [[], [], [], []] // First trick - no completed tricks
    : [[[dummyCard]], [[dummyCard]], [[dummyCard]], [[dummyCard]]]; // Not first trick - simulate completed tricks
  
  // Check if a card is playable using the centralized function
  const checkCardPlayable = (card: Card): boolean => {
    console.log(`checkCardPlayable: Checking ${card.rank} of ${card.suit}`);
    console.log(`checkCardPlayable: currentTurn=${currentTurn}, gameOver=${gameOver}, isProcessing=${isProcessing}, gamePhase=${gamePhase}`);
    
    const result = isCardPlayable(
      card,
      0, // Human player index
      playerHands,
      trickCards,
      heartsBroken,
      tricks,
      currentTurn,
      gameOver,
      isProcessing, // Use isProcessing instead of isProcessingTrickEnd
      false, // isClearingTrick - simplified for now
      gamePhase
    );
    
    console.log(`checkCardPlayable: Result=${result}`);
    return result;
  };
  
  // Handle card click
  const handleCardClick = (card: Card) => {
    console.log(`useCardActions: Card clicked - ${card.rank} of ${card.suit}`);
    
    if (currentTurn === 0 && !gameOver && !isProcessing && gamePhase === 'PLAYING') {
      console.log('useCardActions: It is player\'s turn and game is not over');
      
      // Check if the move is valid
      const playable = checkCardPlayable(card);
      console.log(`useCardActions: Card playable: ${playable}`);
      
      if (playable) {
        // Use the reducer's playCard action - this handles all state updates atomically
        console.log(`useCardActions: Playing card ${card.rank} of ${card.suit} for player 0`);
        playCard(0, card); // Human player is index 0
      } else {
        console.error('Invalid move!');
      }
    } else {
      console.error('Not your turn or game is over');
    }
  };



  return {
    handleCardClick,
    isCardPlayable: checkCardPlayable
  };
}
