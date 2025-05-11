import { Card } from '@/types';

/**
 * Returns a valid card for the computer player to play
 * Implements basic Hearts rules without relying on complex validation
 */
export function getComputerMove(
  playerIndex: number,
  playerHands: Card[][],
  trickCards: Card[] = [],
  heartsBroken: boolean = false,
  tricks: Card[][][] = [[], [], [], []]
): Card | null {
  console.log(`Computer ${playerIndex} thinking...`);
  const hand = playerHands[playerIndex];

  // Basic validation - if no cards, return null
  if (!hand || hand.length === 0) {
    console.log(`Computer ${playerIndex} has no cards!`);
    return null;
  }

  console.log(`Computer ${playerIndex} has ${hand.length} cards:`, hand);

  // SUPER SIMPLE APPROACH - Just pick the first valid card

  // First trick - must play 2 of clubs if leading
  if (tricks.every(playerTricks => playerTricks.length === 0) && trickCards.length === 0) {
    const twoOfClubs = hand.find((card) => card.suit === 'clubs' && card.rank === '2');
    if (twoOfClubs) {
      console.log(`Computer ${playerIndex} playing 2 of clubs (first trick)`);
      return twoOfClubs;
    }
  }

  // Following suit - if there are trick cards, try to follow the lead suit
  if (trickCards.length > 0) {
    const leadSuit = trickCards[0].suit;
    const suitCards = hand.filter((card) => card.suit === leadSuit);

    if (suitCards.length > 0) {
      console.log(`Computer ${playerIndex} following suit with ${suitCards[0].suit}`);
      return suitCards[0];
    }
  }

  // Leading a trick - avoid hearts until broken
  if (trickCards.length === 0 && !heartsBroken) {
    const nonHearts = hand.filter((card) => card.suit !== 'hearts');
    if (nonHearts.length > 0) {
      console.log(`Computer ${playerIndex} leading with non-heart (hearts not broken)`);
      return nonHearts[0];
    }
  }

  // Last resort - play any card
  console.log(`Computer ${playerIndex} playing any card as last resort: ${hand[0].rank} of ${hand[0].suit}`);
  return hand[0];
}
