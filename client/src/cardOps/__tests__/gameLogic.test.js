import { describe, it, expect  } from "vitest"
import { isValidMove, determineTrickWinner, calculateScore } from "../gameLogic"


describe('Hearts Game Logic', () => {
    describe('isValidMove', () => {
        it('should require following suit whenever possible', () => {
            const playerHands = [
                [{ suit: 'hearts', rank: '10'}, {suit: 'clubs', rank: '2'}], 
                [], [], []
            ]
            const trickCards = [{ suit: 'clubs', rank: '2'}]

            // Should be valid to follow suit
            expect(isValidMove({ suit: 'clubs', rank: '5'}, 0, playerHands, trickCards)).toBe(true)

            // Should be invalid to play hearts when clubs can be played
            expect(isValidMove({ suit: 'hearts', rank: '10'}, 0, playerHands, trickCards)).toBe(false)
        })

        it('should required 2 of clubs to start the first trick', () => {
            const playerHands = [
                [{ suit: 'hearts', rank: 'A'}, {suit: 'clubs', rank: '2'}], 
                [{suit: 'diamonds', rank: 'K'}], 
                [{suit: 'spades', rank: 'Q'}], 
                [{suit: 'clubs', rank: 'J'}]
            ]
            // Empty trickcards means this is the first card of a trick
            const trickCards = []

            // Should be valid to play 2 of clubs
            expect(isValidMove({ suit: 'clubs', rank: '2'}, 0, playerHands, trickCards)).toBe(true)

            // Should be invalid to play any other card
            expect(isValidMove({ suit: 'hearts', rank: 'A'}, 0, playerHands, trickCards)).toBe(false)
        })

        it('should prevent hearts from being played until broken', () => {
            const playerHands = [
              [{ suit: 'hearts', rank: '10' }, { suit: 'diamonds', rank: '5' }],
              [], [], []
            ]
            // Empty trickCards means this is the first card of a trick
            const trickCards = []
            // We'll pass false for heartsBroken
            
            // Should be invalid to lead with hearts if hearts not broken
            expect(isValidMove({ suit: 'hearts', rank: '10' }, 0, playerHands, trickCards, false)).toBe(false)
            
            // Should be valid to lead with non-hearts
            expect(isValidMove({ suit: 'diamonds', rank: '5' }, 0, playerHands, trickCards, false)).toBe(true)
            
            // Should be valid to lead with hearts if hearts are broken
            expect(isValidMove({ suit: 'hearts', rank: '10' }, 0, playerHands, trickCards, true)).toBe(true)
          })
    })

    describe('determineTrickWinner', () => {
        it('should determine the winner of a trick', () => {
            const trickCards = [
                { suit: 'clubs', rank: '10' }, // player 0 (lead player)
                { suit: 'clubs', rank: 'K' }, // player 1
                { suit: 'clubs', rank: '2' }, // player 2
                { suit: 'clubs', rank: 'A' } // player 3
            ]

            expect(determineTrickWinner(trickCards, 0)).toBe(3)
        })

        it('should ignore cards that are not of the lead suit', () => {
            const trickCards = [
                { suit: 'diamonds', rank: '5' }, // player 0 (lead player)
                { suit: 'hearts', rank: 'A' }, // player 1
                { suit: 'diamonds', rank: 'K' }, // player 2
                { suit: 'spades', rank: 'Q' } // player 3
            ]

            expect(determineTrickWinner(trickCards, 0)).toBe(2)
        })
    })

    describe('calculateScore', () => {
        it('should assign 1 point for each heart in the trick', () => {
            const tricks = [
                // Player 0's tricks
                [
                    { suit: 'hearts', rank: '2' }, 
                    { suit: 'hearts', rank: '5' },
                    { suit: 'hearts', rank: '10' }  
                ],
                // Player 1's tricks (empty)
                [],
                // Player 2's tricks
                [
                    { suit: 'hearts', rank: 'K' },
                    { suit: 'hearts', rank: 'A' }
                ],
                // Player 3's tricks (empty)
                []
            ]

            expect(calculateScore(tricks)).toEqual([3, 0, 2, 0])
        })

        it('should assign 13 points for the queen of spades in the trick', () => {
            const tricks = [
                // Player 0's tricks
                [
                ],
                // Player 1's tricks (empty)
                [{ suit: 'spades', rank: 'Q' }],
                // Player 2's tricks (empty)
                [],
                // Player 3's tricks (empty)
                []
            ]

            expect(calculateScore(tricks)).toEqual([0, 13, 0, 0])
        })

        it('should correctly calculate combined scores', () => {
            const tricks = [
                // Player 0's tricks
                [
                    { suit: 'hearts', rank: '2' }, 
                    { suit: 'hearts', rank: '5' }, 
                ],
                // Player 1's tricks (empty)
                [
                    { suit: 'spades', rank: 'Q' },
                    { suit: 'hearts', rank: '10' }
                ],

                // Player 2's tricks
                [                ],
                // Player 3's tricks (empty)
                [
                    { suit: 'hearts', rank: 'K' },
                    
                ]
            ]

            expect(calculateScore(tricks)).toEqual([2, 14, 0, 1])
        })
    })
})