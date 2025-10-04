import { Card } from '@/types';
import { determineTrickWinnerWithIndices } from './gameLogic';

/**
 * Calculate points from a completed trick
 * @param completedTrickCards - The cards in the completed trick
 * @returns The total points from the trick
 */
export const calculateTrickPoints = (completedTrickCards: Card[]): number => {
  let points = 0;
  completedTrickCards.forEach(card => {
    if (card.suit === 'hearts') {
      points += 1;
    } else if (card.suit === 'spades' && card.rank === 'Q') {
      points += 13;
    }
  });
  return points;
};

/**
 * Determine the winner of a trick
 * @param completedTrickCards - The cards in the completed trick
 * @param leadPlayer - The player who led the trick
 * @param playerIndices - The player indices corresponding to each card
 * @returns The index of the winning player
 */
export const getTrickWinner = (completedTrickCards: Card[], leadPlayer: number, playerIndices?: number[]): number => {
  // Add more debugging to help diagnose issues
  console.log('trickUtils: Getting trick winner', {
    trickCards: completedTrickCards.map(card => `${card.rank} of ${card.suit}`),
    leadPlayer,
    playerIndices
  });
  
  const winnerIndex = determineTrickWinnerWithIndices(completedTrickCards, leadPlayer, playerIndices);
  console.log(`trickUtils: Determined winner is player ${winnerIndex}`);
  
  return winnerIndex;
};
