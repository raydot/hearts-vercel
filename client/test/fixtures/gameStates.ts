import { GameState, initialGameState } from '@/hooks/useGameReducer'
import { player0HasTwoOfClubs, emptyHands } from './hands'

/**
 * Mock game states for testing different scenarios.
 * These represent the game at various points in time.
 */

// Fresh game, just started
export const freshGame: GameState = {
  ...initialGameState,
}

// Mid-game state (cards dealt, some tricks played)
export const midGame: GameState = {
  ...initialGameState,
  playerHands: player0HasTwoOfClubs,
  currentTurn: 2,
  trickCards: [
    { suit: 'clubs', rank: '2' },
    { suit: 'clubs', rank: '5' },
  ],
  trickPlayerIndices: [0, 1],
  gamePhase: 'PLAYING',
  heartsBroken: false,
  scores: [5, 3, 8, 2],
  roundScores: [5, 3, 8, 2],
  previousScores: [0, 0, 0, 0],
  roundNumber: 1,
}

// Trick complete (4 cards played, waiting to be collected)
export const trickComplete: GameState = {
  ...initialGameState,
  playerHands: player0HasTwoOfClubs.map(hand => hand.slice(1)), // One card removed
  currentTurn: 0,
  trickCards: [
    { suit: 'clubs', rank: '2' },
    { suit: 'clubs', rank: '5' },
    { suit: 'clubs', rank: '8' },
    { suit: 'clubs', rank: 'J' },
  ],
  trickPlayerIndices: [0, 1, 2, 3],
  gamePhase: 'TRICK_COMPLETE',
  heartsBroken: false,
  scores: [0, 0, 0, 0],
  roundScores: [0, 0, 0, 0],
  previousScores: [0, 0, 0, 0],
  roundNumber: 1,
  showCompletedTrick: true,
}

// Round complete (all cards played)
export const roundComplete: GameState = {
  ...initialGameState,
  playerHands: emptyHands,
  currentTurn: 0,
  trickCards: [],
  trickPlayerIndices: [],
  gamePhase: 'ROUND_COMPLETE',
  heartsBroken: true,
  scores: [26, 15, 20, 18],
  roundScores: [26, 15, 20, 18],
  previousScores: [0, 0, 0, 0],
  roundNumber: 1,
  showScoreScreen: true,
  gameOver: false,
}

// Game over (someone reached 100+ points)
export const gameOver: GameState = {
  ...initialGameState,
  playerHands: emptyHands,
  currentTurn: 0,
  trickCards: [],
  trickPlayerIndices: [],
  gamePhase: 'ROUND_COMPLETE',
  heartsBroken: true,
  scores: [105, 87, 92, 78],
  roundScores: [26, 15, 20, 18],
  previousScores: [79, 72, 72, 60],
  roundNumber: 5,
  showScoreScreen: true,
  gameOver: true,
}

// Hearts broken state
export const heartsBroken: GameState = {
  ...initialGameState,
  playerHands: player0HasTwoOfClubs,
  currentTurn: 0,
  trickCards: [],
  trickPlayerIndices: [],
  gamePhase: 'PLAYING',
  heartsBroken: true,
  scores: [5, 3, 8, 2],
  roundScores: [5, 3, 8, 2],
  previousScores: [0, 0, 0, 0],
  roundNumber: 1,
}
