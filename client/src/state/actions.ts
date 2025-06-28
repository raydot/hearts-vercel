import { useAtom, useSetAtom } from 'jotai';
import { useCallback } from 'react';
import { Card } from '../types';
import { dealCards as dealCardsUtil } from '../cardOps/gameEngine';
import { isValidMove, determineTrickWinner, calculateScore } from '../cardOps/gameLogic';
import { getComputerMove } from '../cardOps/computerPlayerLogic';

import {
  gamePhaseAtom,
  currentRoundAtom,
  gameOverAtom,
  playerHandsAtom,
  currentTurnAtom,
  leadPlayerAtom,
  trickCardsAtom,
  trickPlayerIndicesAtom,
  tricksAtom,
  heartsBrokenAtom,
  isProcessingTrickEndAtom,
  isClearingTrickAtom,
  trickAnimationTargetPlayerAtom,
  roundScoresAtom,
  totalScoresAtom,
  shootingPlayerAtom,
  showScoreScreenAtom,
  isHandOverAtom,
  isFinalTrickAtom,
  isLastTrickCompleteAtom
} from './atoms';

// Hook for dealing cards
export function useDealCards() {
  const setPlayerHands = useSetAtom(playerHandsAtom);
  const setCurrentTurn = useSetAtom(currentTurnAtom);
  const setLeadPlayer = useSetAtom(leadPlayerAtom);
  const setTrickCards = useSetAtom(trickCardsAtom);
  const setTrickPlayerIndices = useSetAtom(trickPlayerIndicesAtom);
  const setTricks = useSetAtom(tricksAtom);
  const setHeartsBroken = useSetAtom(heartsBrokenAtom);
  const setGamePhase = useSetAtom(gamePhaseAtom);
  
  return useCallback(() => {
    const { hands, startingPlayerIndex } = dealCardsUtil();
    setPlayerHands(hands);
    setCurrentTurn(startingPlayerIndex);
    setLeadPlayer(startingPlayerIndex);
    setTrickCards([]);
    setTrickPlayerIndices([]);
    setTricks([[], [], [], []]);
    setHeartsBroken(false);
    setGamePhase('PLAYING');
  }, [setPlayerHands, setCurrentTurn, setLeadPlayer, setTrickCards, setTrickPlayerIndices, setTricks, setHeartsBroken, setGamePhase]);
}

// Hook for playing a card
export function usePlayCard() {
  const [playerHands, setPlayerHands] = useAtom(playerHandsAtom);
  const [trickCards, setTrickCards] = useAtom(trickCardsAtom);
  const [trickPlayerIndices, setTrickPlayerIndices] = useAtom(trickPlayerIndicesAtom);
  const [tricks, setTricks] = useAtom(tricksAtom);
  const [heartsBroken, setHeartsBroken] = useAtom(heartsBrokenAtom);
  const [leadPlayer, setLeadPlayer] = useAtom(leadPlayerAtom);
  const setCurrentTurn = useSetAtom(currentTurnAtom);
  const setIsProcessingTrickEnd = useSetAtom(isProcessingTrickEndAtom);
  const setIsClearingTrick = useSetAtom(isClearingTrickAtom);
  const setTrickAnimationTargetPlayer = useSetAtom(trickAnimationTargetPlayerAtom);
  const setRoundScores = useSetAtom(roundScoresAtom);
  const [totalScores, setTotalScores] = useAtom(totalScoresAtom);
  const setShootingPlayer = useSetAtom(shootingPlayerAtom);
  const setGameOver = useSetAtom(gameOverAtom);
  const setShowScoreScreen = useSetAtom(showScoreScreenAtom);
  const setGamePhase = useSetAtom(gamePhaseAtom);
  
  return useCallback((card: Card, playerIndex: number) => {
    // Remove the card from the player's hand
    const newHands = [...playerHands];
    const playerHand = [...newHands[playerIndex]];
    const cardIndex = playerHand.findIndex(c => c.suit === card.suit && c.rank === card.rank);
    
    if (cardIndex === -1) {
      console.error('Card not found in player\'s hand:', card);
      return;
    }
    
    playerHand.splice(cardIndex, 1);
    newHands[playerIndex] = playerHand;
    
    // Add the card to the trick
    const newTrickCards = [...trickCards, card];
    const newTrickPlayerIndices = [...trickPlayerIndices, playerIndex];
    
    // Check if hearts are broken
    let newHeartsBroken = heartsBroken;
    if (card.suit === 'hearts') {
      newHeartsBroken = true;
    }
    
    // Update state
    setPlayerHands(newHands);
    setTrickCards(newTrickCards);
    setTrickPlayerIndices(newTrickPlayerIndices);
    setHeartsBroken(newHeartsBroken);
    
    // Check if the trick is complete (all 4 players have played)
    if (newTrickCards.length === 4) {
      setIsProcessingTrickEnd(true);
      
      // Determine the winner of the trick
      const winnerIndex = determineTrickWinner(newTrickCards, leadPlayer);
      
      // Add the trick to the winner's tricks
      const newTricks = [...tricks];
      newTricks[winnerIndex] = [...newTricks[winnerIndex], ...newTrickCards];
      
      // Delay to allow the UI to show the completed trick
      setTimeout(() => {
        setIsClearingTrick(true);
        setTrickAnimationTargetPlayer(winnerIndex);
        
        // Delay to show the animation of cards moving to the winner
        setTimeout(() => {
          setIsClearingTrick(false);
          setTrickAnimationTargetPlayer(null);
          setTrickCards([]);
          setTrickPlayerIndices([]);
          setTricks(newTricks);
          
          // Check if the hand is over (all players have played all their cards)
          const handIsOver = newHands.every(hand => hand.length === 0);
          
          if (handIsOver) {
            console.log('Round is over!');
            
            // Calculate scores
            const result = calculateScore(newTricks);
            setRoundScores(result.scores);
            
            // Check if someone shot the moon
            if (result.shootingPlayer !== null) {
              const playerNames = ['South (You)', 'West', 'North', 'East'];
              console.log(`${playerNames[result.shootingPlayer]} shot the moon! Subtracting 26 points.`);
              
              // Set the shooting player for UI display
              setShootingPlayer(result.shootingPlayer);
              
              // Subtract 26 from the shooting player's total score
              const newTotalScores = [...totalScores];
              newTotalScores[result.shootingPlayer] -= 26;
              setTotalScores(newTotalScores);
            } else {
              // Reset shooting player
              setShootingPlayer(null);
              
              // Normal scoring - add round scores to total scores
              const newTotalScores = totalScores.map((score, idx) => score + result.scores[idx]);
              setTotalScores(newTotalScores);
            }
            
            // Get the latest total scores for game over check
            const latestTotalScores = result.shootingPlayer !== null
              ? (() => {
                  const scores = [...totalScores];
                  scores[result.shootingPlayer] -= 26;
                  return scores;
                })()
              : totalScores.map((score, idx) => score + result.scores[idx]);
              
            // Check if game is over (any player has 50+ points)
            if (latestTotalScores.some((score: number) => score >= 50)) {
              setGameOver(true);
              console.log('Game over! Final scores after round:', latestTotalScores);
            }
            
            // Update game phase to ROUND_ENDED
            setGamePhase('ROUND_ENDED');
            
            // When the round is over, we need to be careful about when to show the score screen
            // We want to make sure all players get to play their final cards
            
            // If this is the human player's last card, DON'T show score screen yet
            // Let the computer players finish the trick first
            if (playerIndex === 0) {
              console.log('Human played final card - letting computers finish the trick');
              // Don't set showScoreScreen here - let the computers play
            } else {
              // If a computer player played the last card, we can show the score screen
              // But only after a delay to see the final trick completion
              console.log('Computer played final card - showing score screen after delay');
              setTimeout(() => {
                setShowScoreScreen(true);
                setGamePhase('SCORE_SCREEN');
              }, 2000);
            }
          } else {
            // Hand is not over, continue to the next trick
            setCurrentTurn(winnerIndex);
            setLeadPlayer(winnerIndex);
            setIsProcessingTrickEnd(false);
          }
        }, 1000); // Duration for the clearing animation / visual phase
      }, 500); // Short delay to show the 4th card
    } else {
      // Trick is not complete, move to the next player clockwise
      let nextPlayer;
      switch(playerIndex) {
        case 0: nextPlayer = 1; break; // South → West
        case 1: nextPlayer = 2; break; // West → North
        case 2: nextPlayer = 3; break; // North → East
        case 3: nextPlayer = 0; break; // East → South
        default: nextPlayer = 0;
      }
      setCurrentTurn(nextPlayer);
    }
  }, [playerHands, trickCards, trickPlayerIndices, tricks, heartsBroken, leadPlayer, totalScores, setPlayerHands, setTrickCards, setTrickPlayerIndices, setHeartsBroken, setCurrentTurn, setLeadPlayer, setIsProcessingTrickEnd, setIsClearingTrick, setTrickAnimationTargetPlayer, setTricks, setRoundScores, setTotalScores, setShootingPlayer, setGameOver, setShowScoreScreen, setGamePhase]);
}

// Hook for computer turns
export function useHandleComputerTurn() {
  const [currentTurn] = useAtom(currentTurnAtom);
  const [gameOver] = useAtom(gameOverAtom);
  const [playerHands] = useAtom(playerHandsAtom);
  const [trickCards] = useAtom(trickCardsAtom);
  const [heartsBroken] = useAtom(heartsBrokenAtom);
  const [tricks] = useAtom(tricksAtom);
  const [isProcessingTrickEnd] = useAtom(isProcessingTrickEndAtom);
  const [isClearingTrick] = useAtom(isClearingTrickAtom);
  const [trickPlayerIndices] = useAtom(trickPlayerIndicesAtom);
  const [gamePhase] = useAtom(gamePhaseAtom);
  const [isLastTrickComplete] = useAtom(isLastTrickCompleteAtom);
  const [showScoreScreen] = useAtom(showScoreScreenAtom);
  const setShowScoreScreen = useSetAtom(showScoreScreenAtom);
  const setGamePhase = useSetAtom(gamePhaseAtom);
  const playCard = usePlayCard();
  
  return useCallback(() => {
    // Check if the final trick is complete and we need to show the score screen
    if (isLastTrickComplete && !showScoreScreen && !isProcessingTrickEnd && !isClearingTrick && gamePhase === 'ROUND_ENDED') {
      // If this is the final trick and all players have played, show the score screen
      // Add a longer delay to ensure the players can see the final trick completion
      console.log('Final trick complete! Showing score screen after delay...');
      setTimeout(() => {
        setShowScoreScreen(true);
        setGamePhase('SCORE_SCREEN');
      }, 2000);
      return;
    }
    
    // Only proceed with computer turns if it's a computer's turn and the game is in the PLAYING phase
    if (currentTurn !== 0 && !gameOver && !isClearingTrick && !isProcessingTrickEnd && gamePhase === 'PLAYING') { 
      setTimeout(() => {
        // Make sure we still have the right conditions when the timeout executes
        if (currentTurn !== 0 && !gameOver && !isClearingTrick && !isProcessingTrickEnd && gamePhase === 'PLAYING') {
          const computerCard = getComputerMove(currentTurn, playerHands, trickCards, heartsBroken, tricks);
          if (computerCard) {
            playCard(computerCard, currentTurn);
          } else {
            console.error(`Computer ${currentTurn} couldn't find any card to play - this should never happen!`);
          }
        } else {
          console.log('Conditions changed during timeout - skipping computer play');
        }
      }, 800); // Slightly longer delay to make computer moves more visible
    }
  }, [currentTurn, gameOver, playerHands, trickCards, heartsBroken, tricks, playCard, isClearingTrick, isProcessingTrickEnd, gamePhase, isLastTrickComplete, showScoreScreen, setShowScoreScreen, setGamePhase]);
}

// Hook for checking if a card is playable
export function useIsCardPlayable() {
  const [currentTurn] = useAtom(currentTurnAtom);
  const [playerHands] = useAtom(playerHandsAtom);
  const [trickCards] = useAtom(trickCardsAtom);
  const [heartsBroken] = useAtom(heartsBrokenAtom);
  const [tricks] = useAtom(tricksAtom);
  const [isProcessingTrickEnd] = useAtom(isProcessingTrickEndAtom);
  const [isClearingTrick] = useAtom(isClearingTrickAtom);
  const [gamePhase] = useAtom(gamePhaseAtom);
  
  return useCallback((card: Card): boolean => {
    if (currentTurn !== 0) return false; // Not player's turn
    if (isProcessingTrickEnd || isClearingTrick) return false; // Don't allow playing during animations
    if (gamePhase !== 'PLAYING') return false; // Only allow playing during the PLAYING phase
    return isValidMove(card, 0, playerHands, trickCards, heartsBroken, tricks);
  }, [currentTurn, playerHands, trickCards, heartsBroken, tricks, isProcessingTrickEnd, isClearingTrick, gamePhase]);
}

// Hook for handling the next round
export function useHandleNextRound() {
  const setCurrentRound = useSetAtom(currentRoundAtom);
  const setShowScoreScreen = useSetAtom(showScoreScreenAtom);
  const setShootingPlayer = useSetAtom(shootingPlayerAtom);
  const setGamePhase = useSetAtom(gamePhaseAtom);
  const dealCards = useDealCards();
  
  return useCallback(() => {
    setCurrentRound(prev => prev + 1);
    setShowScoreScreen(false);
    setShootingPlayer(null); // Reset shooting player for next round
    setGamePhase('DEALING'); // Set game phase to DEALING before dealing cards
    dealCards();
  }, [setCurrentRound, setShowScoreScreen, setShootingPlayer, setGamePhase, dealCards]);
}

// Hook for starting a new game
export function useHandleNewGame() {
  const setCurrentRound = useSetAtom(currentRoundAtom);
  const setTotalScores = useSetAtom(totalScoresAtom);
  const setShowScoreScreen = useSetAtom(showScoreScreenAtom);
  const setGameOver = useSetAtom(gameOverAtom);
  const setGamePhase = useSetAtom(gamePhaseAtom);
  const dealCards = useDealCards();
  
  return useCallback(() => {
    setCurrentRound(1);
    setTotalScores([0, 0, 0, 0]);
    setShowScoreScreen(false);
    setGameOver(false);
    setGamePhase('DEALING'); // Set game phase to DEALING before dealing cards
    dealCards();
  }, [setCurrentRound, setTotalScores, setShowScoreScreen, setGameOver, setGamePhase, dealCards]);
}
