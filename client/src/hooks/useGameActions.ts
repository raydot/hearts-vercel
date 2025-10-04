import { getComputerMove } from '@/logicOps/computerPlayerLogic';
import { useGameState } from './useGameState';

/**
 * Custom hook to provide game actions using reducer state
 */
export const useGameActions = () => {
  // Get state and actions from the reducer-based hook
  const {
    // Game state
    playerHands,
    trickCards,
    currentTurn,
    heartsBroken,
    gamePhase,
    gameOver,
    isProcessing,
    
    // Actions
    dealCards: dealCardsAction,
    playCard,
    nextRound,
    newGame
  } = useGameState();
  
  // Deal cards function - now uses reducer action
  const dealCards = () => {
    console.log('useGameActions: Dealing cards using reducer action');
    dealCardsAction();
  };
  
  // Handle computer turns - now uses reducer action
  const handleComputerTurn = () => {
    // Only proceed with computer turns if it's a computer's turn and the game is not over
    if (currentTurn !== 0 && !gameOver && !isProcessing && gamePhase === 'PLAYING') {
      console.log(`useGameActions: Computer ${currentTurn}'s turn`);
      
      // Check if the current player's hand is empty
      if (!playerHands[currentTurn] || playerHands[currentTurn].length === 0) {
        console.log(`useGameActions: Computer ${currentTurn} has no cards but it's their turn!`);
        return;
      }
      
      setTimeout(() => {
        // Make sure we still have the right conditions when the timeout executes
        if (currentTurn !== 0 && !gameOver && !isProcessing) {
          console.log(`useGameActions: Getting computer move for player ${currentTurn}`);
          const computerCard = getComputerMove(currentTurn, playerHands, trickCards, heartsBroken, []);
          
          if (computerCard) {
            console.log(`useGameActions: Computer ${currentTurn} plays ${computerCard.rank} of ${computerCard.suit}`);
            // Use the reducer's playCard action - this handles all state updates atomically
            playCard(currentTurn, computerCard);
          } else {
            console.error(`useGameActions: Computer ${currentTurn} couldn't find a valid move!`);
          }
        }
      }, 200); // Reduced delay to make computer moves more responsive
    } else {
      console.log('useGameActions: Not a computer turn or game is over');
    }
  };
  
  // Trick completion is now handled automatically by the reducer
  
  // Handle next round - now uses reducer action
  const handleNextRound = () => {
    console.log('useGameActions: Starting next round using reducer action');
    nextRound();
  };
  
  // Handle new game - now uses reducer action
  const handleNewGame = () => {
    console.log('useGameActions: Starting new game using reducer action');
    newGame();
  };
  
  return {
    dealCards,
    handleComputerTurn,
    handleNextRound,
    handleNewGame
  };
}
