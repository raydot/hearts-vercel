import { Card, Suit, Rank, GameState } from '@/types';
import { isValidMove, calculateScore, getCardValue } from '@/cardOps/gameLogic';

/**
 * Creates and shuffles a deck of cards
 */
export function createDeck(): Card[] {
  const suits: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
  const ranks: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  const deck: Card[] = [];
  
  suits.forEach(suit => {
    ranks.forEach(rank => {
      deck.push({ suit, rank });
    });
  });

  // Shuffle the deck
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  
  return deck;
}

/**
 * Deals cards to players
 */
export function dealCards(): Card[][] {
  const deck = createDeck();
  const hands: Card[][] = [[], [], [], []];
  
  deck.forEach((card, index) => {
    const playerIndex = index % 4;
    hands[playerIndex].push(card);
  });
  
  // Sort hands by suit and rank for easier play
  hands.forEach(hand => {
    sortHand(hand);
  });
  
  return hands;
}

/**
 * Sorts a hand of cards by suit and rank
 */
export function sortHand(hand: Card[]): Card[] {
  return hand.sort((a, b) => {
    const suitOrder: Record<Suit, number> = {
      'clubs': 0,
      'diamonds': 1,
      'spades': 2,
      'hearts': 3
    };
    
    if (a.suit !== b.suit) {
      return suitOrder[a.suit] - suitOrder[b.suit];
    }
    
    const rankOrder: Record<Rank, number> = {
      '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
      '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14
    };
    
    return rankOrder[a.rank] - rankOrder[b.rank];
  });
}

/**
 * Finds the player with the 2 of clubs
 */
export function findStartingPlayer(hands: Card[][]): number {
  let startingPlayer = 0;
  
  hands.forEach((hand, index) => {
    if (hand.some(card => card.suit === 'clubs' && card.rank === '2')) {
      startingPlayer = index;
    }
  });
  
  return startingPlayer;
}

/**
 * Plays a card and returns updated game state information
 */
export function playCard(
  card: Card,
  playerIndex: number,
  playerHands: Card[][],
  trickCards: Card[],
  tricks: Card[][][],
  heartsBroken: boolean,

  trickPlayerIndices: number[] = [] // Add optional parameter for trickPlayerIndices
): {
  newHands: Card[][],
  newTrickCards: Card[],
  newTricks: Card[][][],
  newHeartsBroken: boolean,
  trickComplete: boolean,
  winnerIndex: number,
  scores: number[]
} {
  // Remove card from player's hand
  const newHands = [...playerHands];
  newHands[playerIndex] = newHands[playerIndex].filter(
    c => !(c.suit === card.suit && c.rank === card.rank)
  );
  
  // Add card to current trick
  const newTrickCards = [...trickCards, card];
  
  // Update trickPlayerIndices to include this player if not provided
  const updatedTrickPlayerIndices = [...(trickPlayerIndices || []), playerIndex];
  console.log('Updated trick player indices:', updatedTrickPlayerIndices);
  
  // Check if hearts are broken
  const newHeartsBroken = heartsBroken || card.suit === 'hearts';
  
  // Default values if trick is not complete
  let trickComplete = false;
  let winnerIndex = -1;
  let newTricks = [...tricks];
  let scores = [0, 0, 0, 0];
  
  // If all players have played a card, determine the winner
  if (newTrickCards.length === 4) {
    trickComplete = true;
    
    // Find the index of the highest card in the trick array
    const highestCardIndex = findHighestCardIndex(newTrickCards);
    
    // Use the trickPlayerIndices to get the actual player who played the winning card
    winnerIndex = updatedTrickPlayerIndices[highestCardIndex];
    
    console.log('Trick complete! Winner:', winnerIndex, 'Cards:', newTrickCards);
    console.log('Trick length check:', newTrickCards.length);
    console.log('Highest card index in trick:', highestCardIndex);
    console.log('Player indices:', updatedTrickPlayerIndices);
    console.log('Winner is player:', winnerIndex);
    
    // Add trick to winner's tricks
    newTricks = [...tricks];
    if (Array.isArray(newTricks[winnerIndex])) {
      // If it's already an array of arrays, add the new trick
      newTricks[winnerIndex] = [...newTricks[winnerIndex], newTrickCards];
    } else {
      // Initialize with the new trick as the first element
      newTricks[winnerIndex] = [newTrickCards];
    }
    
    // Calculate scores
    scores = calculateScore(newTricks);
  } else {
    console.log('Card played:', card, 'by player', playerIndex, 'Current trick:', newTrickCards);
    console.log('Trick length check:', newTrickCards.length);
  }
  
  return {
    newHands,
    newTrickCards,
    newTricks,
    newHeartsBroken,
    trickComplete,
    winnerIndex,
    scores
  };
}

/**
 * Finds the index of the highest card in the trick that matches the lead suit
 */
function findHighestCardIndex(trickCards: Card[]): number {
  if (trickCards.length === 0) return -1;
  
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
  
  return highestRankIndex;
}

/**
 * Checks if a move is valid based on the current game state
 */
export function validateMove(
  card: Card,
  playerIndex: number,
  playerHands: Card[][],
  trickCards: Card[] = [],
  heartsBroken: boolean = false,
  tricks: Card[][][] = [[], [], [], []]
): boolean {
  return isValidMove(card, playerIndex, playerHands, trickCards, heartsBroken, tricks);
}

/**
 * Gets the next game state
 */
export function getNextState (
  currentState: GameState, 
  action: {type: 'PLAY_CARD', card: Card, playerIndex: number} | {type: 'DEAL_CARDS'}
): GameState {
  // Handle different action types
  switch (action.type) {
    case 'PLAY_CARD':
      // In a real implementation, we would handle playing a card here
      console.log('Playing card:', action.card, 'by player', action.playerIndex);
      break;
    case 'DEAL_CARDS':
      // In a real implementation, we would handle dealing cards here
      console.log('Dealing cards');
      break;
  }
  
  // For now, just return the current state
  return currentState;
}
