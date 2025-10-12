import { describe, it, expect } from 'vitest'
import {
  getCardValue,
  isValidMove,
  determineTrickWinner,
  determineTrickWinnerWithIndices,
  calculateScore,
  checkGameEnd,
} from './gameLogic'
import { Card } from '@/types'

describe('cardOps/gameLogic', () => {
  describe('getCardValue', () => {
    it('should return correct values for number cards', () => {
      expect(getCardValue('2')).toBe(2)
      expect(getCardValue('5')).toBe(5)
      expect(getCardValue('10')).toBe(10)
    })

    it('should return correct values for face cards', () => {
      expect(getCardValue('J')).toBe(11)
      expect(getCardValue('Q')).toBe(12)
      expect(getCardValue('K')).toBe(13)
      expect(getCardValue('A')).toBe(14)
    })

    it('should return 0 for invalid rank', () => {
      expect(getCardValue('X')).toBe(0)
    })
  })

  describe('determineTrickWinner', () => {
    it('should determine winner when all follow suit', () => {
      const trickCards: Card[] = [
        { suit: 'clubs', rank: '5' },  // Lead player
        { suit: 'clubs', rank: '7' },
        { suit: 'clubs', rank: 'A' },  // Highest clubs
        { suit: 'clubs', rank: '3' },
      ]

      const winner = determineTrickWinner(trickCards, 0)
      expect(winner).toBe(2) // Player 2 has Ace of clubs
    })

    it('should ignore off-suit cards', () => {
      const trickCards: Card[] = [
        { suit: 'clubs', rank: '5' },   // Lead player
        { suit: 'hearts', rank: 'A' },  // Off-suit (ignored)
        { suit: 'clubs', rank: '7' },   // Highest clubs
        { suit: 'spades', rank: 'K' },  // Off-suit (ignored)
      ]

      const winner = determineTrickWinner(trickCards, 0)
      expect(winner).toBe(2) // Player 2 has 7 of clubs (highest on-suit)
    })

    it('should handle lead player winning', () => {
      const trickCards: Card[] = [
        { suit: 'clubs', rank: 'A' },  // Lead player with Ace
        { suit: 'clubs', rank: '5' },
        { suit: 'clubs', rank: '7' },
        { suit: 'clubs', rank: '3' },
      ]

      const winner = determineTrickWinner(trickCards, 0)
      expect(winner).toBe(0) // Lead player wins
    })

    it('should always use first card as lead suit', () => {
      const trickCards: Card[] = [
        { suit: 'hearts', rank: '5' },  // Lead suit (always first card)
        { suit: 'clubs', rank: 'K' },
        { suit: 'hearts', rank: 'A' },  // Highest hearts
        { suit: 'clubs', rank: '3' },
      ]

      const winner = determineTrickWinner(trickCards, 1)
      expect(winner).toBe(2) // Index 2 has Ace of hearts (lead suit)
    })
  })

  describe('determineTrickWinnerWithIndices', () => {
    it('should determine winner with explicit player indices', () => {
      const trickCards: Card[] = [
        { suit: 'clubs', rank: '5' },
        { suit: 'clubs', rank: 'A' },
        { suit: 'clubs', rank: '3' },
        { suit: 'clubs', rank: '7' },
      ]
      const playerIndices = [0, 2, 1, 3] // Players in order

      const winner = determineTrickWinnerWithIndices(trickCards, 0, playerIndices)
      expect(winner).toBe(2) // Player 2 wins with Ace
    })

    it('should fallback to determineTrickWinner if no indices provided', () => {
      const trickCards: Card[] = [
        { suit: 'clubs', rank: '5' },
        { suit: 'clubs', rank: 'A' },
        { suit: 'clubs', rank: '3' },
        { suit: 'clubs', rank: '7' },
      ]

      const winner = determineTrickWinnerWithIndices(trickCards, 0)
      expect(winner).toBe(1) // Player 1 has Ace
    })
  })

  describe('calculateScore', () => {
    it('should calculate basic scores (hearts = 1 point each)', () => {
      // Format: Card[][][] where tricks[playerIndex] = array of tricks won by that player
      const tricks: Card[][][] = [
        // Player 0 won 1 trick with 2 hearts
        [
          [
            { suit: 'clubs', rank: '5' },
            { suit: 'hearts', rank: '3' },  // 1 point
            { suit: 'hearts', rank: '5' },  // 1 point
            { suit: 'clubs', rank: '7' },
          ],
        ],
        [], // Player 1 won no tricks
        [], // Player 2 won no tricks
        [], // Player 3 won no tricks
      ]

      const result = calculateScore(tricks)
      expect(result.scores).toEqual([2, 0, 0, 0]) // Player 0 has 2 hearts
      expect(result.shootingPlayer).toBeNull()
    })

    it('should give Queen of Spades 13 points', () => {
      const tricks: Card[][][] = [
        // Player 0 won 1 trick with Q♠
        [
          [
            { suit: 'spades', rank: 'Q' },  // 13 points
            { suit: 'spades', rank: '3' },
            { suit: 'spades', rank: '5' },
            { suit: 'spades', rank: '7' },
          ],
        ],
        [], // Player 1
        [], // Player 2
        [], // Player 3
      ]

      const result = calculateScore(tricks)
      expect(result.scores).toEqual([13, 0, 0, 0]) // Player 0 won trick with Q♠
      expect(result.shootingPlayer).toBeNull()
    })

    it('should detect shooting the moon (all 26 points)', () => {
      const tricks: Card[][][] = [
        // Player 0 wins all hearts + Q♠ (26 points total)
        [
          [
            { suit: 'hearts', rank: 'A' },
            { suit: 'hearts', rank: '2' },
            { suit: 'hearts', rank: '3' },
            { suit: 'hearts', rank: '4' },
          ],
          [
            { suit: 'hearts', rank: '5' },
            { suit: 'hearts', rank: '6' },
            { suit: 'hearts', rank: '7' },
            { suit: 'hearts', rank: '8' },
          ],
          [
            { suit: 'hearts', rank: '9' },
            { suit: 'hearts', rank: '10' },
            { suit: 'hearts', rank: 'J' },
            { suit: 'hearts', rank: 'Q' },
          ],
          [
            { suit: 'hearts', rank: 'K' },
            { suit: 'spades', rank: 'Q' },  // Q♠
            { suit: 'clubs', rank: '3' },
            { suit: 'clubs', rank: '4' },
          ],
        ],
        [], // Player 1 won no tricks
        [], // Player 2 won no tricks
        [], // Player 3 won no tricks
      ]

      const result = calculateScore(tricks)
      expect(result.scores).toEqual([-26, 0, 0, 0]) // Shooter gets -26
      expect(result.shootingPlayer).toBe(0)
    })

    it('should not shoot moon if missing any point card', () => {
      const tricks: Card[][][] = [
        // Player 0 has 25 points (12 hearts + Q♠)
        [
          [
            { suit: 'hearts', rank: 'A' },
            { suit: 'hearts', rank: '2' },
            { suit: 'hearts', rank: '3' },
            { suit: 'hearts', rank: '4' },
          ],
          [
            { suit: 'hearts', rank: '5' },
            { suit: 'hearts', rank: '6' },
            { suit: 'hearts', rank: '7' },
            { suit: 'hearts', rank: '8' },
          ],
          [
            { suit: 'hearts', rank: '9' },
            { suit: 'hearts', rank: '10' },
            { suit: 'hearts', rank: 'J' },
            { suit: 'hearts', rank: 'Q' },
          ],
          [
            { suit: 'spades', rank: 'Q' },  // Q♠ (13 points)
            { suit: 'clubs', rank: '3' },
            { suit: 'clubs', rank: '4' },
            { suit: 'clubs', rank: '5' },
          ],
        ],
        // Player 1 gets 1 heart
        [
          [
            { suit: 'hearts', rank: 'K' },  // 1 point
            { suit: 'diamonds', rank: '3' },
            { suit: 'diamonds', rank: '4' },
            { suit: 'diamonds', rank: '5' },
          ],
        ],
        [], // Player 2
        [], // Player 3
      ]

      const result = calculateScore(tricks)
      expect(result.scores[0]).toBe(25) // Player 0 has 25 points
      expect(result.scores[1]).toBe(1)  // Player 1 has 1 point
      expect(result.shootingPlayer).toBeNull()
    })
  })

  describe('checkGameEnd', () => {
    it('should return true when all hands are empty', () => {
      const emptyHands: Card[][] = [[], [], [], []]
      expect(checkGameEnd(emptyHands)).toBe(true)
    })

    it('should return false when any hand has cards', () => {
      const handsWithCards: Card[][] = [
        [],
        [{ suit: 'clubs', rank: '5' }],
        [],
        [],
      ]
      expect(checkGameEnd(handsWithCards)).toBe(false)
    })

    it('should return false when all hands have cards', () => {
      const fullHands: Card[][] = [
        [{ suit: 'clubs', rank: '2' }],
        [{ suit: 'clubs', rank: '3' }],
        [{ suit: 'clubs', rank: '4' }],
        [{ suit: 'clubs', rank: '5' }],
      ]
      expect(checkGameEnd(fullHands)).toBe(false)
    })
  })

  describe('isValidMove', () => {
    const mockHands: Card[][] = [
      [
        { suit: 'clubs', rank: '2' },
        { suit: 'clubs', rank: '5' },
        { suit: 'hearts', rank: 'A' },
      ],
      [
        { suit: 'diamonds', rank: '5' },
        { suit: 'spades', rank: 'Q' },
      ],
      [],
      [],
    ]

    describe('first trick rules', () => {
      it('should require 2 of clubs on first trick', () => {
        const valid = isValidMove(
          { suit: 'clubs', rank: '2' },
          0,
          mockHands,
          [], // trickCards
          false, // heartsBroken
          [[], [], [], []] // tricks (empty = first trick)
        )
        expect(valid).toBe(true)
      })

      it('should reject non-2C on first trick if player has it', () => {
        const valid = isValidMove(
          { suit: 'clubs', rank: '5' },
          0,
          mockHands,
          [], // trickCards
          false, // heartsBroken
          [[], [], [], []] // tricks (empty = first trick)
        )
        expect(valid).toBe(false)
      })

      // TODO: Implement first trick point card prevention
      it.skip('should prevent hearts on first trick', () => {
        const handsNoClubs: Card[][] = [
          [{ suit: 'hearts', rank: 'A' }, { suit: 'diamonds', rank: '5' }],
          [],
          [],
          [],
        ]

        const valid = isValidMove(
          { suit: 'hearts', rank: 'A' },
          0,
          handsNoClubs,
          [{ suit: 'clubs', rank: '2' }], // 2C already played
          false, // heartsBroken
          [[], [], [], []] // tricks (empty = first trick)
        )
        expect(valid).toBe(false)
      })

      // TODO: Implement first trick point card prevention
      it.skip('should prevent Queen of Spades on first trick', () => {
        const valid = isValidMove(
          { suit: 'spades', rank: 'Q' },
          1,
          mockHands,
          [{ suit: 'clubs', rank: '2' }],
          false, // heartsBroken
          [[], [], [], []] // tricks (empty = first trick)
        )
        expect(valid).toBe(false)
      })
    })

    describe('following suit', () => {
      it('should require following suit if possible', () => {
        const trickCards: Card[] = [{ suit: 'clubs', rank: '3' }]

        const valid = isValidMove(
          { suit: 'clubs', rank: '5' },
          0,
          mockHands,
          trickCards,
          false, // heartsBroken
          [[[]]] // tricks (not first trick)
        )
        expect(valid).toBe(true)
      })

      it('should reject wrong suit if player has led suit', () => {
        const trickCards: Card[] = [{ suit: 'clubs', rank: '3' }]

        const valid = isValidMove(
          { suit: 'hearts', rank: 'A' },
          0,
          mockHands,
          trickCards,
          false, // heartsBroken
          [[[]]] // tricks (not first trick)
        )
        expect(valid).toBe(false)
      })

      it('should allow any card if player lacks led suit', () => {
        const trickCards: Card[] = [{ suit: 'clubs', rank: '3' }]

        const valid = isValidMove(
          { suit: 'diamonds', rank: '5' },
          1,
          mockHands,
          trickCards,
          false, // heartsBroken
          [[[]]] // tricks (not first trick)
        )
        expect(valid).toBe(true)
      })
    })

    describe('hearts breaking', () => {
      it('should prevent leading hearts before hearts broken', () => {
        const valid = isValidMove(
          { suit: 'hearts', rank: 'A' },
          0,
          mockHands,
          [],
          false, // Hearts not broken
          [[[]]] // tricks (not first trick)
        )
        expect(valid).toBe(false)
      })

      it('should allow leading hearts after hearts broken', () => {
        const valid = isValidMove(
          { suit: 'hearts', rank: 'A' },
          0,
          mockHands,
          [],
          true, // Hearts broken
          [[[]]] // tricks (not first trick)
        )
        expect(valid).toBe(true)
      })

      it('should allow leading hearts if only hearts in hand', () => {
        const onlyHearts: Card[][] = [
          [{ suit: 'hearts', rank: 'A' }, { suit: 'hearts', rank: 'K' }],
          [],
          [],
          [],
        ]

        const valid = isValidMove(
          { suit: 'hearts', rank: 'A' },
          0,
          onlyHearts,
          [],
          false, // Hearts not broken
          [[[]]] // tricks (not first trick)
        )
        expect(valid).toBe(true)
      })
    })
  })
})
