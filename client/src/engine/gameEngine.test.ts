import { describe, it, expect } from 'vitest'
import { dealCards, findStartingPlayer } from './gameEngine'

describe('gameEngine', () => {
  describe('dealCards', () => {
    it('should deal 4 hands of 13 cards each', () => {
      const hands = dealCards()

      expect(hands).toHaveLength(4)
      expect(hands[0]).toHaveLength(13)
      expect(hands[1]).toHaveLength(13)
      expect(hands[2]).toHaveLength(13)
      expect(hands[3]).toHaveLength(13)
    })

    it('should deal all 52 unique cards', () => {
      const hands = dealCards()
      const allCards = hands.flat()

      expect(allCards).toHaveLength(52)

      // Check for duplicates
      const cardStrings = allCards.map(c => `${c.suit}-${c.rank}`)
      const uniqueCards = new Set(cardStrings)
      expect(uniqueCards.size).toBe(52)
    })

    it('should include the 2 of clubs somewhere', () => {
      const hands = dealCards()
      const allCards = hands.flat()

      const twoOfClubs = allCards.find(
        c => c.suit === 'clubs' && c.rank === '2'
      )

      expect(twoOfClubs).toBeDefined()
    })
  })

  describe('findStartingPlayer', () => {
    it('should find player with 2 of clubs', () => {
      const hands = [
        [{ suit: 'hearts' as const, rank: 'A' as const }],
        [{ suit: 'clubs' as const, rank: '2' as const }], // Player 1 has it
        [{ suit: 'spades' as const, rank: 'K' as const }],
        [{ suit: 'diamonds' as const, rank: 'Q' as const }],
      ]

      const startingPlayer = findStartingPlayer(hands)
      expect(startingPlayer).toBe(1)
    })

    it('should return 0 if no one has 2 of clubs (edge case)', () => {
      const hands = [
        [{ suit: 'hearts' as const, rank: 'A' as const }],
        [{ suit: 'hearts' as const, rank: 'K' as const }],
        [{ suit: 'spades' as const, rank: 'K' as const }],
        [{ suit: 'diamonds' as const, rank: 'Q' as const }],
      ]

      const startingPlayer = findStartingPlayer(hands)
      expect(startingPlayer).toBe(0) // Default fallback
    })
  })

  // Note: Card validation logic is in cardOps/gameLogic.ts (isValidMove)
  // We'll test that in a separate test file
})

