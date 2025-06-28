import { useAtom } from 'jotai';
import { playerHandsAtom, currentTurnAtom, gameOverAtom, trickCardsAtom, heartsBrokenAtom, trickPlayerIndicesAtom, tricksAtom, leadPlayerAtom, roundScoresAtom, totalScoresAtom, isClearingTrickAtom, trickAnimationTargetPlayerAtom, showScoreScreenAtom, isProcessingTrickEndAtom, gamePhaseAtom } from '@/state/atoms';
import { Card } from '@/types';
import { isValidMove } from '@/cardOps/gameLogic';
import { calculateTrickPoints, getTrickWinner } from '@/cardOps/trickUtils';

/**
 * Custom hook to provide card playing actions using Jotai atoms
 */
export function useCardActions() {
  // Get state from atoms
  const [playerHands, setPlayerHands] = useAtom(playerHandsAtom);
  const [currentTurn, setCurrentTurn] = useAtom(currentTurnAtom);
  const [gameOver, setGameOver] = useAtom(gameOverAtom);
  const [trickCards, setTrickCards] = useAtom(trickCardsAtom);
  const [heartsBroken, setHeartsBroken] = useAtom(heartsBrokenAtom);
  const [trickPlayerIndices, setTrickPlayerIndices] = useAtom(trickPlayerIndicesAtom);
  const [tricks, setTricks] = useAtom(tricksAtom);
  const [leadPlayer, setLeadPlayer] = useAtom(leadPlayerAtom);
  const [roundScores, setRoundScores] = useAtom(roundScoresAtom);
  const [totalScores, setTotalScores] = useAtom(totalScoresAtom);
  const [isClearingTrick, setIsClearingTrick] = useAtom(isClearingTrickAtom);
  const [isProcessingTrickEnd, setIsProcessingTrickEnd] = useAtom(isProcessingTrickEndAtom);
  const [, setTrickAnimationTargetPlayer] = useAtom(trickAnimationTargetPlayerAtom);
  const [, setShowScoreScreen] = useAtom(showScoreScreenAtom);
  const [gamePhase, setGamePhase] = useAtom(gamePhaseAtom);
  
  // Check if a card is playable
  const isCardPlayable = (card: Card): boolean => {
    if (currentTurn !== 0) return false; // Not player's turn
    if (gameOver) return false; // Game is over
    if (isProcessingTrickEnd || isClearingTrick) return false; // Don't allow playing during animations
    if (gamePhase !== 'PLAYING') return false; // Only allow playing during the PLAYING phase
    
    return isValidMove(card, 0, playerHands, trickCards, heartsBroken, tricks);
  };
  
  // Handle card click
  const handleCardClick = (card: Card) => {
    console.log(`useCardActions: Card clicked - ${card.rank} of ${card.suit}`);
    
    if (currentTurn === 0 && !gameOver && !isProcessingTrickEnd && !isClearingTrick && gamePhase === 'PLAYING') {
      console.log('useCardActions: It is player\'s turn and game is not over');
      
      // Check if the move is valid
      const playable = isCardPlayable(card);
      console.log(`useCardActions: Card playable: ${playable}`);
      
      if (playable) {
        // Implementation of playCard logic
        const playerIndex = 0; // Human player
        
        // Remove the card from the player's hand
        const newPlayerHands = [...playerHands];
        const playerHand = [...newPlayerHands[playerIndex]];
        const cardIndex = playerHand.findIndex(c => c.suit === card.suit && c.rank === card.rank);
        
        console.log(`useCardActions: Card index in hand: ${cardIndex}`);
        
        if (cardIndex !== -1) {
          playerHand.splice(cardIndex, 1);
          newPlayerHands[playerIndex] = playerHand;
          console.log('useCardActions: Updating player hands', newPlayerHands);
          setPlayerHands(newPlayerHands);
          
          // Add the card to the trick
          const newTrickCards = [...trickCards, card];
          console.log('useCardActions: Updating trick cards', newTrickCards);
          setTrickCards(newTrickCards);
          
          // Update trick player indices
          const newTrickPlayerIndices = [...trickPlayerIndices, playerIndex];
          console.log('useCardActions: Updating trick player indices', newTrickPlayerIndices);
          setTrickPlayerIndices(newTrickPlayerIndices);
          
          // Check if hearts are broken
          if (card.suit === "hearts" && !heartsBroken) {
            console.log('useCardActions: Hearts are now broken!');
            setHeartsBroken(true);
          }
          
          // Move to the next player's turn
          const nextTurn = (currentTurn + 1) % 4;
          console.log(`useCardActions: Moving to next player's turn: ${nextTurn}`);
          setCurrentTurn(nextTurn);
          
          // Check if trick is complete (4 cards played)
          if (newTrickCards.length === 4) {
            console.log('useCardActions: Trick complete, handling trick completion');
            handleTrickCompletion(newTrickCards, newTrickPlayerIndices);
          }
        } else {
          console.error('Card not found in player\'s hand');
        }
      } else {
        console.error('Invalid move!');
      }
    } else {
      console.error('Not your turn or game is over');
    }
  };

  // Handle trick completion
  const handleTrickCompletion = (completedTrickCards: Card[], playerIndices: number[]) => {
    // Prevent duplicate trick handling - check both flags
    if (isClearingTrick || isProcessingTrickEnd) {
      console.log('useCardActions: Already processing trick, ignoring duplicate call');
      return;
    }
    
    // Set both flags immediately to prevent race conditions
    setIsProcessingTrickEnd(true);
    setIsClearingTrick(true);
    
    // Update game phase
    setGamePhase('TRICK_COMPLETED');
    
    console.log('useCardActions: Handling trick completion', { completedTrickCards, playerIndices });
    
    // Determine the winner of the trick
    const winnerIndex = getTrickWinner(completedTrickCards, leadPlayer);
    console.log(`useCardActions: Trick winner is player ${winnerIndex}`);
    
    // Show animation for trick winner
    setIsClearingTrick(true);
    setTrickAnimationTargetPlayer(winnerIndex);
    
    // Calculate points from this trick
    const points = calculateTrickPoints(completedTrickCards);
    console.log(`useCardActions: Points from this trick: ${points}`);
    
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
      
      if (isHandOver) {
        console.log('useCardActions: Hand is over, updating total scores');
        // Update total scores and check for game over
        const newTotalScores = [...totalScores];
        for (let i = 0; i < 4; i++) {
          newTotalScores[i] += roundScores[i];
        }
        setTotalScores(newTotalScores);
        
        // Check if any player has reached 100 points (game over)
        const gameIsOver = newTotalScores.some(score => score >= 100);
        if (gameIsOver) {
          console.log('useCardActions: Game over, someone reached 100 points');
          setGameOver(true);
        } else {
          // Show score screen between rounds
          setShowScoreScreen(true);
          setGamePhase('SCORE_SCREEN');
        }
      } else {
        // Set the winner as the lead player for the next trick
        console.log(`useCardActions: Setting player ${winnerIndex} as lead player for next trick`);
        setLeadPlayer(winnerIndex);
        setCurrentTurn(winnerIndex);
        
        // Set game phase back to PLAYING
        setGamePhase('PLAYING');
        
        // If the next player is a computer, trigger their turn after a short delay
        // We need to manually trigger computer turns here since we don't have access to handleComputerTurn
        if (winnerIndex !== 0) {
          console.log(`useCardActions: Next player ${winnerIndex} is a computer, they will play in the next render cycle`);
        }
      }
    }, 1500);
  };

  return { handleCardClick, isCardPlayable, handleTrickCompletion };
}
