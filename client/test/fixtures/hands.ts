import { Card } from '@/types'

/**
 * Mock card hands for deterministic testing.
 * Each scenario has 4 hands (one per player).
 */

// Player 0 has the 2 of clubs (starts the game)
export const player0HasTwoOfClubs: Card[][] = [
  [
    { suit: 'clubs', rank: '2' },
    { suit: 'clubs', rank: '3' },
    { suit: 'clubs', rank: '4' },
    { suit: 'diamonds', rank: '5' },
    { suit: 'diamonds', rank: '6' },
    { suit: 'diamonds', rank: '7' },
    { suit: 'spades', rank: '8' },
    { suit: 'spades', rank: '9' },
    { suit: 'spades', rank: '10' },
    { suit: 'hearts', rank: 'J' },
    { suit: 'hearts', rank: 'Q' },
    { suit: 'hearts', rank: 'K' },
    { suit: 'hearts', rank: 'A' },
  ],
  [
    { suit: 'clubs', rank: '5' },
    { suit: 'clubs', rank: '6' },
    { suit: 'clubs', rank: '7' },
    { suit: 'diamonds', rank: '8' },
    { suit: 'diamonds', rank: '9' },
    { suit: 'diamonds', rank: '10' },
    { suit: 'spades', rank: 'J' },
    { suit: 'spades', rank: 'Q' },
    { suit: 'spades', rank: 'K' },
    { suit: 'hearts', rank: '2' },
    { suit: 'hearts', rank: '3' },
    { suit: 'hearts', rank: '4' },
    { suit: 'hearts', rank: '5' },
  ],
  [
    { suit: 'clubs', rank: '8' },
    { suit: 'clubs', rank: '9' },
    { suit: 'clubs', rank: '10' },
    { suit: 'diamonds', rank: 'J' },
    { suit: 'diamonds', rank: 'Q' },
    { suit: 'diamonds', rank: 'K' },
    { suit: 'spades', rank: '2' },
    { suit: 'spades', rank: '3' },
    { suit: 'spades', rank: '4' },
    { suit: 'hearts', rank: '6' },
    { suit: 'hearts', rank: '7' },
    { suit: 'hearts', rank: '8' },
    { suit: 'hearts', rank: '9' },
  ],
  [
    { suit: 'clubs', rank: 'J' },
    { suit: 'clubs', rank: 'Q' },
    { suit: 'clubs', rank: 'K' },
    { suit: 'clubs', rank: 'A' },
    { suit: 'diamonds', rank: '2' },
    { suit: 'diamonds', rank: '3' },
    { suit: 'diamonds', rank: '4' },
    { suit: 'diamonds', rank: 'A' },
    { suit: 'spades', rank: '5' },
    { suit: 'spades', rank: '6' },
    { suit: 'spades', rank: '7' },
    { suit: 'spades', rank: 'A' },
    { suit: 'hearts', rank: '10' },
  ],
]

// Player 1 shoots the moon (all hearts + Q♠)
export const player1ShootsTheMoon: Card[][] = [
  [
    { suit: 'clubs', rank: '2' },
    { suit: 'clubs', rank: '3' },
    { suit: 'clubs', rank: '4' },
    { suit: 'clubs', rank: '5' },
    { suit: 'diamonds', rank: '2' },
    { suit: 'diamonds', rank: '3' },
    { suit: 'diamonds', rank: '4' },
    { suit: 'diamonds', rank: '5' },
    { suit: 'spades', rank: '2' },
    { suit: 'spades', rank: '3' },
    { suit: 'spades', rank: '4' },
    { suit: 'spades', rank: '5' },
    { suit: 'spades', rank: '6' },
  ],
  [
    // Player 1 has ALL hearts + Queen of Spades
    { suit: 'hearts', rank: '2' },
    { suit: 'hearts', rank: '3' },
    { suit: 'hearts', rank: '4' },
    { suit: 'hearts', rank: '5' },
    { suit: 'hearts', rank: '6' },
    { suit: 'hearts', rank: '7' },
    { suit: 'hearts', rank: '8' },
    { suit: 'hearts', rank: '9' },
    { suit: 'hearts', rank: '10' },
    { suit: 'hearts', rank: 'J' },
    { suit: 'hearts', rank: 'Q' },
    { suit: 'hearts', rank: 'K' },
    { suit: 'hearts', rank: 'A' },
    { suit: 'spades', rank: 'Q' }, // Queen of Spades
  ],
  [
    { suit: 'clubs', rank: '6' },
    { suit: 'clubs', rank: '7' },
    { suit: 'clubs', rank: '8' },
    { suit: 'clubs', rank: '9' },
    { suit: 'diamonds', rank: '6' },
    { suit: 'diamonds', rank: '7' },
    { suit: 'diamonds', rank: '8' },
    { suit: 'diamonds', rank: '9' },
    { suit: 'spades', rank: '7' },
    { suit: 'spades', rank: '8' },
    { suit: 'spades', rank: '9' },
    { suit: 'spades', rank: '10' },
    { suit: 'spades', rank: 'J' },
  ],
  [
    { suit: 'clubs', rank: '10' },
    { suit: 'clubs', rank: 'J' },
    { suit: 'clubs', rank: 'Q' },
    { suit: 'clubs', rank: 'K' },
    { suit: 'clubs', rank: 'A' },
    { suit: 'diamonds', rank: '10' },
    { suit: 'diamonds', rank: 'J' },
    { suit: 'diamonds', rank: 'Q' },
    { suit: 'diamonds', rank: 'K' },
    { suit: 'diamonds', rank: 'A' },
    { suit: 'spades', rank: 'K' },
    { suit: 'spades', rank: 'A' },
  ],
]

// Empty hands (for testing round completion)
export const emptyHands: Card[][] = [[], [], [], []]

// Single card hands (for testing last trick)
export const lastTrickHands: Card[][] = [
  [{ suit: 'clubs', rank: '2' }],
  [{ suit: 'clubs', rank: '3' }],
  [{ suit: 'clubs', rank: '4' }],
  [{ suit: 'clubs', rank: '5' }],
]
