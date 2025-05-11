import { Card } from "@/types";

// HELPER FUNCTIONS

// Determine if this is the first trick of the game
const isFirstTrick = (_playerHands: Card[][], tricks: Card[][][]): boolean => {
  // If any player has played a trick, it's not the first trick
  return tricks.every(playerTricks => playerTricks.length === 0);
};

// Get numeric value of card rank
const getCardValue = (rank: string): number => {
  const rankValues: Record<string, number> = {
    '2': 2,
    '3': 3,
    '4': 4,
    '5': 5,
    '6': 6,
    '7': 7,
    '8': 8,
    '9': 9,
    '10': 10,
    'J': 11,
    'Q': 12,
    'K': 13,
    'A': 14
  };
  return rankValues[rank] || 0;
};

export const isValidMove = (
  card: Card, 
  playerIndex: number, 
  playerHands: Card[][], 
  trickCards: Card[] = [], 
  heartsBroken: boolean = false,
  tricks: Card[][][] = [[], [], [], []]
): boolean => {
  // Debug logging
  console.log('isValidMove called with:', {
    card,
    playerIndex,
    trickCards,
    heartsBroken,
    isFirstTrick: isFirstTrick(playerHands, tricks)
  });
  // Get the player's hand
  const playerHand = playerHands[playerIndex];
  
  // If this is the first card played in the trick
  if (trickCards.length === 0) {
    // First trick must lead with 2 of clubs
    if (isFirstTrick(playerHands, tricks)) {
      return card.suit === 'clubs' && card.rank === '2';
    }
    
    // Can't lead with hearts until hearts are broken
    if (card.suit === 'hearts' && !heartsBroken) {
      // Exception: if player only has hearts
      const onlyHasHearts = playerHand.every(c => c.suit === 'hearts');
      return onlyHasHearts;
    }
    
    // All other leads are valid
    return true;
  }
  // must follow suit if possible
  const leadSuit = trickCards[0].suit;
  const hasLeadSuit = playerHands[playerIndex].some(card => card.suit === leadSuit);
  if (hasLeadSuit) {
    return card.suit === leadSuit;
  }

  // If player doesn't have lead suit can play any card
  return true;
};

export const determineTrickWinner = (trickCards: Card[], leadPlayerIndex: number): number => {
  if (trickCards.length !== 4) return -1;

  const leadSuit = trickCards[0].suit;
  let highestRankIndex = 0;
  let highestRankValue = getCardValue(trickCards[0].rank);

  for (let i = 1; i < trickCards.length; i++) {
    const card = trickCards[i];
    const cardValue = getCardValue(card.rank);
    
    // Only cards of the lead suit can win the trick
    if (card.suit === leadSuit && cardValue > highestRankValue) {
      highestRankIndex = i;
      highestRankValue = cardValue;
    }
  }

  // Calculate the actual player index based on the lead player index
  const winnerIndex = (leadPlayerIndex + highestRankIndex) % 4;
  return winnerIndex;
};

export const calculateScore = (tricks: Card[][][]): number[] => {
  const scores = [0, 0, 0, 0];

  tricks.forEach((playerTricks, playerIndex) => {
    playerTricks.forEach((card) => {
      if (card.suit === 'hearts') {
        scores[playerIndex] += 1;
      }
      if (card.suit === 'spades' && card.rank === 'Q') {
        scores[playerIndex] += 13;
      }
    });
  });

  return scores;
};

export const checkGameEnd = (playerHands: Card[][]): boolean => {
  // Logic to see if game has ended
  const allHandsEmpty = playerHands.every((hand) => hand.length === 0);
  return allHandsEmpty;
};
