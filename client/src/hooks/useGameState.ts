import { useReducer, useCallback, useEffect } from 'react';
import { gameReducer, initialGameState, GameAction } from './useGameReducer';
import { Card } from '@/types/index';
import { dealCards as dealCardsEngine } from '@/engine/gameEngine';
import { getComputerMove } from '@/logicOps/computerPlayerLogic';
import { determineTrickWinner } from '@/cardOps/gameLogic';

export function useGameState() {
  const [state, dispatch] = useReducer(gameReducer, initialGameState);

  // Dispatch wrapper with logging
  const safeDispatch = useCallback((action: GameAction) => {
    console.log('useGameState: Dispatching action:', action.type);
    dispatch(action);
  }, []);

  // Deal new cards
  const dealCards = useCallback(() => {
    console.log('useGameState: Dealing new cards');
    const newHands = dealCardsEngine();
    console.log('useGameState: dealCardsEngine returned:', newHands);
    console.log('useGameState: newHands type:', typeof newHands, 'length:', newHands?.length);
    if (newHands && newHands.length > 0) {
      console.log('useGameState: First hand length:', newHands[0]?.length);
    }
    safeDispatch({ type: 'DEAL_CARDS', payload: { hands: newHands } });
  }, [safeDispatch]);

  // Play a card (human or computer)
  const playCard = useCallback((playerIndex: number, card: Card) => {
    console.log(`useGameState: Player ${playerIndex} attempting to play ${card.rank} of ${card.suit}`);
    safeDispatch({ type: 'PLAY_CARD', payload: { playerIndex, card } });
  }, [safeDispatch]);

  // Handle trick completion
  const completeTrick = useCallback(() => {
    if (state.trickCards.length !== 4) {
      console.log('useGameState: Cannot complete trick - not 4 cards');
      return;
    }

    console.log('useGameState: Completing trick');
    
    // Determine winner
    const leadPlayerIndex = state.trickPlayerIndices[0];
    const winner = determineTrickWinner(state.trickCards, leadPlayerIndex);
    const actualWinnerIndex = state.trickPlayerIndices[winner];
    
    // Calculate points
    const points = state.trickCards.reduce((total, card) => {
      if (card.suit === 'hearts') return total + 1;
      if (card.suit === 'spades' && card.rank === 'Q') return total + 13;
      return total;
    }, 0);

    console.log(`useGameState: Trick winner is player ${actualWinnerIndex}, points: ${points}`);
    
    safeDispatch({ 
      type: 'COMPLETE_TRICK', 
      payload: { winner: actualWinnerIndex, points } 
    });
  }, [state.trickCards, state.trickPlayerIndices, safeDispatch]);

  // Start new trick
  const startNewTrick = useCallback((leadPlayer: number) => {
    console.log(`useGameState: Starting new trick with player ${leadPlayer} leading`);
    safeDispatch({ type: 'START_NEW_TRICK', payload: { leadPlayer } });
  }, [safeDispatch]);

  // Computer turn logic
  const handleComputerTurn = useCallback(() => {
    if (state.isProcessing) {
      console.log('useGameState: Skipping computer turn - currently processing');
      return;
    }

    if (state.currentTurn === 0) {
      console.log('useGameState: Skipping computer turn - human player turn');
      return;
    }

    if (state.gamePhase !== 'PLAYING') {
      console.log('useGameState: Skipping computer turn - not in PLAYING phase');
      return;
    }

    const currentPlayerHand = state.playerHands[state.currentTurn];
    if (!currentPlayerHand || currentPlayerHand.length === 0) {
      console.log(`useGameState: Player ${state.currentTurn} has no cards`);
      return;
    }

    console.log(`useGameState: Computer ${state.currentTurn} taking turn`);
    
    const computerCard = getComputerMove(
      state.currentTurn,
      state.playerHands,
      state.trickCards,
      state.heartsBroken,
      [] // tricks history - can be added later
    );

    if (computerCard) {
      playCard(state.currentTurn, computerCard);
    } else {
      console.log(`useGameState: No valid move for computer ${state.currentTurn}`);
    }
  }, [state, playCard]);

  // Effect: Handle computer turns
  useEffect(() => {
    if (state.currentTurn !== 0 && 
        state.gamePhase === 'PLAYING' && 
        !state.isProcessing &&
        !state.gameOver &&
        !state.showCompletedTrick &&
        state.trickCards.length < 4) {
      
      console.log(`useGameState: Scheduling computer turn for player ${state.currentTurn}`);
      const timeoutId = setTimeout(() => {
        handleComputerTurn();
      }, 500); // Delay for better UX

      return () => clearTimeout(timeoutId);
    }
  }, [state.currentTurn, state.gamePhase, state.isProcessing, state.gameOver, handleComputerTurn]);

  // Effect: Handle trick completion
  useEffect(() => {
    if (state.gamePhase === 'TRICK_COMPLETE') {
      console.log('useGameState: Trick complete, waiting briefly before processing...');
      // Small delay to ensure the 4th card renders before processing
      const timeoutId = setTimeout(() => {
        completeTrick();
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, [state.gamePhase, completeTrick]);

  // Effect: Handle completed trick display
  useEffect(() => {
    if (state.showCompletedTrick) {
      console.log('useGameState: Showing completed trick for 1.5 seconds');
      const timeoutId = setTimeout(() => {
        // Check if round is over (all hands empty)
        const isRoundOver = state.playerHands.every(hand => hand.length === 0);
        
        if (isRoundOver) {
          // Round is complete - dispatch COMPLETE_ROUND
          console.log('useGameState: Round is over, completing round');
          safeDispatch({ type: 'COMPLETE_ROUND' });
        } else if (state.trickCards.length === 4) {
          // Normal trick - start new trick
          const leadPlayerIndex = state.trickPlayerIndices[0];
          const winner = determineTrickWinner(state.trickCards, leadPlayerIndex);
          const actualWinnerIndex = state.trickPlayerIndices[winner];
          startNewTrick(actualWinnerIndex);
        }
      }, 1500); // 1.5 seconds to view the completed trick

      return () => clearTimeout(timeoutId);
    }
  }, [state.showCompletedTrick, state.trickCards, state.trickPlayerIndices, state.playerHands, startNewTrick, safeDispatch]);

  // Effect: Handle round completion - show score screen after brief delay
  useEffect(() => {
    if (state.gamePhase === 'ROUND_COMPLETE' && !state.showScoreScreen) {
      console.log('useGameState: Round complete, showing score screen after brief delay');
      const timeoutId = setTimeout(() => {
        safeDispatch({ type: 'SHOW_SCORE_SCREEN' });
      }, 500); // Brief delay before showing score screen
      
      return () => clearTimeout(timeoutId);
    }
  }, [state.gamePhase, state.showScoreScreen, safeDispatch]);

  // Next round action
  const nextRound = useCallback(() => {
    console.log('useGameState: Starting next round');
    safeDispatch({ type: 'NEXT_ROUND' });
  }, [safeDispatch]);

  // New game action
  const newGame = useCallback(() => {
    console.log('useGameState: Starting new game');
    safeDispatch({ type: 'NEW_GAME' });
  }, [safeDispatch]);

  return {
    // State
    ...state,
    
    // Actions
    dealCards,
    playCard,
    completeTrick,
    startNewTrick,
    handleComputerTurn,
    nextRound,
    newGame,
  };
}
