import { useAtom } from 'jotai';
import { playerHandsAtom, currentTurnAtom, gameOverAtom, trickCardsAtom, heartsBrokenAtom, tricksAtom, leadPlayerAtom, totalScoresAtom, currentRoundAtom, shootingPlayerAtom, showScoreScreenAtom, trickPlayerIndicesAtom, roundScoresAtom, isClearingTrickAtom, trickAnimationTargetPlayerAtom, isProcessingTrickEndAtom, gamePhaseAtom } from '@/state/atoms';
import * as gameEngine from '@/engine/gameEngine';
import { getComputerMove } from '@/logicOps/computerPlayerLogic';
import { calculateTrickPoints, getTrickWinner } from '@/cardOps/trickUtils';
import { Card } from '@/types';

/**
 * Custom hook to provide game actions using Jotai atoms
 */
export function useGameActions() {
  // Get all the atoms we need
  const [playerHands, setPlayerHands] = useAtom(playerHandsAtom);
  const [currentTurn, setCurrentTurn] = useAtom(currentTurnAtom);
  const [gameOver, setGameOver] = useAtom(gameOverAtom);
  const [trickCards, setTrickCards] = useAtom(trickCardsAtom);
  const [heartsBroken, setHeartsBroken] = useAtom(heartsBrokenAtom);
  const [tricks, setTricks] = useAtom(tricksAtom);
  const [leadPlayer, setLeadPlayer] = useAtom(leadPlayerAtom);
  const [, setCurrentRound] = useAtom(currentRoundAtom);
  const [totalScores, setTotalScores] = useAtom(totalScoresAtom);
  const [, setShootingPlayer] = useAtom(shootingPlayerAtom);
  const [showScoreScreen, setShowScoreScreen] = useAtom(showScoreScreenAtom);
  const [trickPlayerIndices, setTrickPlayerIndices] = useAtom(trickPlayerIndicesAtom);
  const [roundScores, setRoundScores] = useAtom(roundScoresAtom);
  const [isClearingTrick, setIsClearingTrick] = useAtom(isClearingTrickAtom);
  const [isProcessingTrickEnd, setIsProcessingTrickEnd] = useAtom(isProcessingTrickEndAtom);
  const [, setTrickAnimationTargetPlayer] = useAtom(trickAnimationTargetPlayerAtom);
  const [gamePhase, setGamePhase] = useAtom(gamePhaseAtom);
  
  // Deal cards function
  const dealCards = () => {
    // Use game engine to create hands
    const newHands = gameEngine.dealCards();
    setPlayerHands(newHands);
    
    // Find player with 2 of clubs to start
    const startingPlayer = gameEngine.findStartingPlayer(newHands);
    
    // Reset game state for new round
    setCurrentTurn(startingPlayer);
    setLeadPlayer(startingPlayer);
    setGameOver(false);
    setTrickCards([]);
    setTricks([[], [], [], []]);
    setHeartsBroken(false);
  };
  
  // Handle computer turns
  const handleComputerTurn = () => {
    // Check if the round is over (all hands empty)
    const allHandsEmpty = playerHands.every(hand => hand.length === 0);
    
    // Check if we're in the final trick
    const isLastTrick = allHandsEmpty;
    
    // Check if we need to show the score screen after all computer players have played their final cards
    const finalTrickComplete = trickPlayerIndices.length === 4 && isLastTrick;
    
    console.log('useGameActions: Computer turn check:', { 
      currentTurn, 
      allHandsEmpty, 
      trickPlayerIndices: trickPlayerIndices.length,
      finalTrickComplete,
      showScoreScreen,
      isProcessingTrickEnd,
      isClearingTrick,
      gamePhase
    });
    
    if (finalTrickComplete && !showScoreScreen && !isProcessingTrickEnd && !isClearingTrick) {
      // If this is the final trick and all players have played, show the score screen
      console.log('useGameActions: Final trick complete! Showing score screen after delay...');
      
      // IMPORTANT: Stop all game play until the user closes the score screen
      setTimeout(() => {
        setShowScoreScreen(true);
        setGamePhase('SCORE_SCREEN');
      }, 2000);
      return;
    }
    
    // Only proceed with computer turns if it's a computer's turn and the game is not over
    // and we're not in the middle of processing a trick or showing score screen
    if (currentTurn !== 0 && !gameOver && !isClearingTrick && !isProcessingTrickEnd && gamePhase === 'PLAYING') {
      console.log(`useGameActions: Computer ${currentTurn}'s turn`);  
      console.log(`useGameActions: Current trick cards:`, trickCards);
      console.log(`useGameActions: Computer hand:`, playerHands[currentTurn]);
      console.log(`useGameActions: All player hands:`, playerHands.map(hand => hand.length));
      
      // Check if the current player's hand is empty - this shouldn't happen but let's handle it
      if (!playerHands[currentTurn] || playerHands[currentTurn].length === 0) {
        console.error(`useGameActions: Computer ${currentTurn} has no cards but it's their turn!`);
        // Move to the next player to avoid getting stuck
        const nextTurn = (currentTurn + 1) % 4;
        console.log(`useGameActions: Skipping to next player ${nextTurn}`);
        setCurrentTurn(nextTurn);
        return;
      }
      
      setTimeout(() => {
        // Make sure we still have the right conditions when the timeout executes
        if (currentTurn !== 0 && !gameOver) {
          console.log(`useGameActions: Getting computer move for player ${currentTurn}`);
          const computerCard = getComputerMove(currentTurn, playerHands, trickCards, heartsBroken, tricks);
          
          if (computerCard) {
            console.log(`useGameActions: Computer ${currentTurn} plays ${computerCard.rank} of ${computerCard.suit}`);
            
            // Remove the card from the computer's hand
            const newPlayerHands = [...playerHands];
            const computerHand = [...newPlayerHands[currentTurn]];
            const cardIndex = computerHand.findIndex(c => c.suit === computerCard.suit && c.rank === computerCard.rank);
            
            console.log(`useGameActions: Card index in computer hand: ${cardIndex}`);
            
            if (cardIndex !== -1) {
              computerHand.splice(cardIndex, 1);
              newPlayerHands[currentTurn] = computerHand;
              console.log('useGameActions: Updating player hands', newPlayerHands);
              setPlayerHands(newPlayerHands);
              
              // Add the card to the trick
              const newTrickCards = [...trickCards, computerCard];
              console.log('useGameActions: Updating trick cards', newTrickCards);
              setTrickCards(newTrickCards);
              
              // Update trick player indices
              const newTrickPlayerIndices = [...trickPlayerIndices, currentTurn];
              console.log('useGameActions: Updating trick player indices', newTrickPlayerIndices);
              setTrickPlayerIndices(newTrickPlayerIndices);
              
              // Check if hearts are broken
              if (computerCard.suit === "hearts" && !heartsBroken) {
                console.log('useGameActions: Hearts are now broken!');
                setHeartsBroken(true);
              }
              
              // Move to the next player's turn
              const nextTurn = (currentTurn + 1) % 4;
              console.log(`useGameActions: Moving to next player's turn: ${nextTurn}`);
              setCurrentTurn(nextTurn);
              
              // Check if trick is complete (4 cards played)
              if (newTrickCards.length === 4) {
                console.log('useGameActions: Trick complete, handling trick completion');
                // Handle trick completion immediately to avoid timing issues
                handleTrickCompletion(newTrickCards, newTrickPlayerIndices);
              } else if (newTrickCards.length > 4) {
                console.log('useGameActions: ERROR - More than 4 cards in trick! Handling trick completion anyway.');
                // This shouldn't happen, but handle it gracefully
                handleTrickCompletion(newTrickCards.slice(0, 4), newTrickPlayerIndices.slice(0, 4));
              }
            } else {
              console.error(`useGameActions: Card not found in computer ${currentTurn}'s hand!`);
            }
          } else {
            console.error(`useGameActions: Computer ${currentTurn} couldn't find a valid move!`);
            console.log('useGameActions: Computer hand:', playerHands[currentTurn]);
            console.log('useGameActions: Hearts broken:', heartsBroken);
            
            // Move to the next player to avoid getting stuck
            const nextTurn = (currentTurn + 1) % 4;
            console.log(`useGameActions: Skipping to next player ${nextTurn} due to no valid move`);
            setCurrentTurn(nextTurn);
          }
        } else {
          console.log(`useGameActions: Conditions changed, no longer computer ${currentTurn}'s turn or game is over`);
        }
      }, 800); // Slightly longer delay to make computer moves more visible
    } else {
      console.log('useGameActions: Not a computer turn or game is over');
    }
  };
  
  // Handle trick completion
  const handleTrickCompletion = (completedTrickCards: Card[], playerIndices: number[]) => {
    // Prevent duplicate trick handling - check both flags
    if (isClearingTrick || isProcessingTrickEnd) {
      console.log('useGameActions: Already processing trick, ignoring duplicate call');
      return;
    }
    
    // Set both flags immediately to prevent race conditions
    setIsProcessingTrickEnd(true);
    setIsClearingTrick(true);
    
    // Update game phase
    setGamePhase('TRICK_COMPLETED');
    
    console.log('useGameActions: Handling trick completion', { completedTrickCards, playerIndices });
    
    // Determine the winner of the trick
    const winnerIndex = getTrickWinner(completedTrickCards, leadPlayer);
    console.log(`useGameActions: Trick winner is player ${winnerIndex}`);
    
    // Show animation for trick winner
    setIsClearingTrick(true);
    setTrickAnimationTargetPlayer(winnerIndex);
    
    // Calculate points from this trick
    const points = calculateTrickPoints(completedTrickCards);
    console.log(`useGameActions: Points from this trick: ${points}`);
    
    // Update scores if there are points
    if (points > 0) {
      const newRoundScores = [...roundScores];
      newRoundScores[winnerIndex] += points;
      setRoundScores(newRoundScores);
    }
    
    // Add the completed trick to the tricks history
    const newTricks = [...tricks];
    newTricks[winnerIndex].push([...completedTrickCards]);
    setTricks(newTricks);
    
    // After a delay, clear the trick and set up for the next one
    setTimeout(() => {
      // Clear the trick cards and player indices
      setTrickCards([]);
      setTrickPlayerIndices([]);
      setIsClearingTrick(false);
      setIsProcessingTrickEnd(false);
      setTrickAnimationTargetPlayer(null);
      
      // Check if the hand is over (all cards played)
      const isHandOver = playerHands.every(hand => hand.length === 0);
      
      // Set game phase back to PLAYING if the hand is not over
      if (!isHandOver) {
        setGamePhase('PLAYING');
      }
      
      if (isHandOver) {
        console.log('useGameActions: Hand is over, updating total scores');
        console.log('useGameActions: Round scores before update:', roundScores);
        
        // Update total scores and check for game over
        const newTotalScores = [...totalScores];
        for (let i = 0; i < 4; i++) {
          newTotalScores[i] += roundScores[i];
        }
        console.log('useGameActions: Total scores after update:', newTotalScores);
        setTotalScores(newTotalScores);
        
        // Check if any player has reached 100 points (game over)
        const gameIsOver = newTotalScores.some(score => score >= 100);
        if (gameIsOver) {
          console.log('useGameActions: Game over, someone reached 100 points');
          setGameOver(true);
        } else {
          // Show score screen between rounds
          console.log('useGameActions: Showing score screen before next round');
          setShowScoreScreen(true);
          setGamePhase('SCORE_SCREEN');
          
          // Clear all trick-related state to ensure clean state for next round
          setTrickCards([]);
          setTrickPlayerIndices([]);
          setIsClearingTrick(false);
          setIsProcessingTrickEnd(false);
          setTrickAnimationTargetPlayer(null);
        }
      } else {
        // Set the winner as the lead player for the next trick
        console.log(`useGameActions: Setting player ${winnerIndex} as lead player for next trick`);
        setLeadPlayer(winnerIndex);
        setCurrentTurn(winnerIndex);
        
        // If the next player is a computer, trigger their turn after a short delay
        if (winnerIndex !== 0) {
          console.log(`useGameActions: Next player ${winnerIndex} is a computer, triggering their turn`);
          setTimeout(() => handleComputerTurn(), 1000);
        }
      }
    }, 1500);
  };
  
  // Handle next round
  const handleNextRound = () => {
    console.log('useGameActions: Starting next round');
    setCurrentRound(prev => prev + 1);
    setShowScoreScreen(false);
    setShootingPlayer(null); // Reset shooting player for next round
    
    // Reset round scores
    setRoundScores([0, 0, 0, 0]);
    
    // Reset trick-related state
    setTrickCards([]);
    setTrickPlayerIndices([]);
    setIsClearingTrick(false);
    setIsProcessingTrickEnd(false);
    setTrickAnimationTargetPlayer(null);
    
    // Reset hearts broken for new round
    setHeartsBroken(false);
    
    // Reset game phase
    setGamePhase('DEALING');
    
    // Deal cards for the new round
    dealCards();
    
    // Set game phase to PLAYING after dealing
    setTimeout(() => {
      setGamePhase('PLAYING');
    }, 500);
  };
  
  // Handle new game
  const handleNewGame = () => {
    console.log('useGameActions: Starting a new game');
    // Reset scores
    setTotalScores([0, 0, 0, 0]);
    setRoundScores([0, 0, 0, 0]);
    
    // Reset game state
    setCurrentRound(1);
    setGameOver(false);
    setShowScoreScreen(false);
    setShootingPlayer(null);
    
    // Reset trick-related state
    setTrickCards([]);
    setTrickPlayerIndices([]);
    setIsClearingTrick(false);
    setIsProcessingTrickEnd(false);
    setTrickAnimationTargetPlayer(null);
    
    // Reset hearts broken for new game
    setHeartsBroken(false);
    
    // Reset game phase
    setGamePhase('DEALING');
    
    // Deal new cards
    dealCards();
    
    // Set game phase to PLAYING after dealing
    setTimeout(() => {
      setGamePhase('PLAYING');
    }, 500);
  };
  
  return {
    dealCards,
    handleComputerTurn,
    handleNextRound,
    handleNewGame,
    handleTrickCompletion
  };
}
