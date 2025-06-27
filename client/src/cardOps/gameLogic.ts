import { Card } from "@/types";

// HELPER FUNCTIONS

// Determine if this is the first trick of the game
const isFirstTrick = (_playerHands: Card[][], tricks: Card[][][]): boolean => {
  // If any player has played a trick, it's not the first trick
  return tricks.every(playerTricks => playerTricks.length === 0);
};

// Get numeric value of card rank
export const getCardValue = (rank: string): number => {
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
  console.log('[determineTrickWinner] Called with:', { 
    trickCards: JSON.parse(JSON.stringify(trickCards)), // Deep copy for logging
    leadPlayerIndex 
  });

  if (trickCards.length !== 4) {
    console.log('[determineTrickWinner] Trick length not 4, returning -1. Length:', trickCards.length);
    return -1;
  }

  const leadSuit = trickCards[0].suit;
  let highestRankIndex = 0;
  let highestRankValue = getCardValue(trickCards[0].rank);
  console.log(`[determineTrickWinner] Initial: leadSuit=${leadSuit}, highestRankIndex=0 (Card: ${trickCards[0].rank}${trickCards[0].suit}), highestRankValue=${highestRankValue}`);

  for (let i = 1; i < trickCards.length; i++) {
    const card = trickCards[i];
    const cardValue = getCardValue(card.rank);
    console.log(`[determineTrickWinner] Loop i=${i}: Card=${card.rank}${card.suit}, Value=${cardValue}`);
    
    if (card.suit === leadSuit && cardValue > highestRankValue) {
      highestRankIndex = i;
      highestRankValue = cardValue;
      console.log(`[determineTrickWinner] New highest: highestRankIndex=${i} (Card: ${card.rank}${card.suit}), highestRankValue=${highestRankValue}`);
    } else if (card.suit !== leadSuit) {
      console.log(`[determineTrickWinner] Card ${card.rank}${card.suit} not lead suit.`);
    } else {
      console.log(`[determineTrickWinner] Card ${card.rank}${card.suit} not higher value.`);
    }
  }

  const winnerIndex = (leadPlayerIndex + highestRankIndex) % 4;
  console.log(`[determineTrickWinner] Final calculation: (leadPlayerIndex=${leadPlayerIndex} + highestRankIndex=${highestRankIndex}) % 4 = ${winnerIndex}`);
  console.log(`[determineTrickWinner] Winner index: ${winnerIndex}`);
  console.log(`[determineTrickWinner] Trick cards: ${JSON.stringify(trickCards)}`);
  console.log(`[determineTrickWinner] Lead player index: ${leadPlayerIndex}`);
  console.log(`[determineTrickWinner] Highest rank index: ${highestRankIndex}`);
  console.log(`[determineTrickWinner] Highest rank value: ${highestRankValue}`);
  return winnerIndex;
};

export const calculateScore = (tricks: Card[][][] | Card[][]): number[] => {
  const scores = [0, 0, 0, 0];

  // Handle both data structures: Card[][][] from game engine and Card[][] from tests
  tricks.forEach((playerTricks, playerIndex) => {
    if (!playerTricks) return;
    
    playerTricks.forEach((item) => {
      // Check if item is a Card or an array of Cards
      if (item && typeof item === 'object') {
        if ('suit' in item) {
          // Direct Card object (test structure)
          const card = item as Card;
          if (card.suit === 'hearts') {
            scores[playerIndex] += 1;
          }
          if (card.suit === 'spades' && card.rank === 'Q') {
            scores[playerIndex] += 13;
          }
        } else if (Array.isArray(item)) {
          // Array of Cards (game engine structure)
          item.forEach((card) => {
            if (card.suit === 'hearts') {
              scores[playerIndex] += 1;
            }
            if (card.suit === 'spades' && card.rank === 'Q') {
              scores[playerIndex] += 13;
            }
          });
        }
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
