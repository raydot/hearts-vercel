import { Card, Suit, Rank, GameState } from '@/types';
import { isValidMove, determineTrickWinner, calculateScore, checkGameEnd } from '@/cardOps/gameLogic';

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
  leadPlayer: number
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
    winnerIndex = determineTrickWinner(newTrickCards, leadPlayer);
    
    // Add trick to winner's tricks
    newTricks = [...tricks];
    newTricks[winnerIndex] = [...newTricks[winnerIndex], ...newTrickCards];
    
    // Calculate scores
    scores = calculateScore(newTricks);
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
 * Checks if a move is valid based on the current game state
 */
export function validateMove(
  card: Card,
  playerIndex: number,
  playerHands: Card[][],
  trickCards: Card[] = [],
  heartsBroken: boolean = false
): boolean {
  return isValidMove(card, playerIndex, playerHands, trickCards, heartsBroken);
}

/**
 * Gets the next game state
 */
export function getNextState (
  currentState: GameState, 
  action: {type: 'PLAY_CARD', card: Card, playerIndex: number} | {type: 'DEAL_CARDS'}
): GameState {
  // pure function blah blah
  // Implementation
  return currentState;
}
