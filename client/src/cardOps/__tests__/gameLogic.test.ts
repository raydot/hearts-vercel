import { describe, it, expect } from 'vitest';
import { isValidMove, determineTrickWinner, calculateScore, checkGameEnd } from '../gameLogic';
import { Card } from '@/types';


describe('Hearts Game Logic', () => {
    describe('isValidMove', () => {
        it('should require following suit whenever possible', () => {
            const playerHands: Card[][] = [
                [{ suit: 'hearts', rank: '10' }, { suit: 'clubs', rank: '2' }],
                [], [], []
            ];
            const trickCards: Card[] = [{ suit: 'clubs', rank: '2' }];

            // Should be valid to follow suit
            expect(isValidMove({ suit: 'clubs', rank: '5' } as Card, 0, playerHands, trickCards)).toBe(true);

            // Should be invalid to play hearts when clubs can be played
            expect(isValidMove({ suit: 'hearts', rank: '10' } as Card, 0, playerHands, trickCards)).toBe(false);
        });

        it('should required 2 of clubs to start the first trick', () => {
            const playerHands: Card[][] = [
                [{ suit: 'hearts', rank: 'A' }, { suit: 'clubs', rank: '2' }],
                [{ suit: 'diamonds', rank: 'K' }],
                [{ suit: 'spades', rank: 'Q' }],
                [{ suit: 'clubs', rank: 'J' }]
            ];
            // Empty trickcards means this is the first card of a trick
            const trickCards: Card[] = [];

            // Should be valid to play 2 of clubs
            expect(isValidMove({ suit: 'clubs', rank: '2' } as Card, 0, playerHands, trickCards)).toBe(true);

            // Should be invalid to play any other card
            expect(isValidMove({ suit: 'hearts', rank: 'A' } as Card, 0, playerHands, trickCards)).toBe(false);
        });

        it('should prevent hearts from being played until broken', () => {
            const playerHands: Card[][] = [
              [{ suit: 'hearts', rank: '10' }, { suit: 'diamonds', rank: '5' }],
              [], [], []
            ];
            // Empty trickCards means this is the first card of a trick
            const trickCards: Card[] = [];
            // Add some tricks to indicate it's not the first trick of the game
            const tricks: Card[][][] = [[[{ suit: 'clubs', rank: '2' } as Card]], [], [], []];
            // We'll pass false for heartsBroken

            // Should be invalid to lead with hearts if hearts not broken
            expect(isValidMove({ suit: 'hearts', rank: '10' } as Card, 0, playerHands, trickCards, false, tricks)).toBe(false);

            // Should be valid to lead with non-hearts
            expect(isValidMove({ suit: 'diamonds', rank: '5' } as Card, 0, playerHands, trickCards, false, tricks)).toBe(true);

            // Should be valid to lead with hearts if hearts are broken
            expect(isValidMove({ suit: 'hearts', rank: '10' } as Card, 0, playerHands, trickCards, true, tricks)).toBe(true);
          });

        it('should allow leading with a heart if the player only has hearts', () => {
            const playerHands: Card[][] = [
                [{ suit: 'hearts', rank: '10' }, { suit: 'hearts', rank: 'A' }],
                [], [], []
            ];
            const trickCards: Card[] = [];
            const tricks: Card[][][] = [[[{ suit: 'clubs', rank: '3' } as Card]], [], [], []]; // Not the first trick

            // Should be valid to lead with a heart if it's all you have
            expect(isValidMove({ suit: 'hearts', rank: '10' } as Card, 0, playerHands, trickCards, false, tricks)).toBe(true);
        });

        it('should allow playing any card if unable to follow suit', () => {
            const playerHands: Card[][] = [
                [{ suit: 'hearts', rank: 'Q' }], // Player 0 only has a heart
                [], [], []
            ];
            const trickCards: Card[] = [{ suit: 'clubs', rank: '5' } as Card]; // Lead is clubs

            // Player 0 cannot follow suit, so playing the Queen of Hearts should be valid
            expect(isValidMove({ suit: 'hearts', rank: 'Q' } as Card, 0, playerHands, trickCards, false)).toBe(true);
        });
    })

    describe('determineTrickWinner', () => {
        it('should determine the winner of a trick', () => {
            const trickCards: Card[] = [
                { suit: 'clubs', rank: '10' }, // player 0 (lead player)
                { suit: 'clubs', rank: 'K' }, // player 1
                { suit: 'clubs', rank: '2' }, // player 2
                { suit: 'clubs', rank: 'A' } // player 3
            ]

            expect(determineTrickWinner(trickCards, 0)).toBe(3)
        })

        it('should ignore cards that are not of the lead suit', () => {
            const trickCards: Card[] = [
                { suit: 'diamonds', rank: '5' }, // player 0 (lead player)
                { suit: 'hearts', rank: 'A' }, // player 1
                { suit: 'diamonds', rank: 'K' }, // player 2
                { suit: 'spades', rank: 'Q' } // player 3
            ]

            expect(determineTrickWinner(trickCards, 0)).toBe(2)
        })

        it('should return -1 if trickCards length is not 4', () => {
            const trickCards: Card[] = [{ suit: 'spades', rank: 'A' }, { suit: 'spades', rank: 'K' }];
            expect(determineTrickWinner(trickCards, 0)).toBe(-1);
        });

        it('should correctly determine winner when leader plays highest card', () => {
            const leadPlayerIndex = 0; // South leads
            const trickCards: Card[] = [
              { suit: 'spades', rank: 'A'}, // South (Leader)
              { suit: 'spades', rank: '2'}, // West
              { suit: 'spades', rank: '3'}, // North
              { suit: 'spades', rank: '4'}  // East
            ];
            expect(determineTrickWinner(trickCards, leadPlayerIndex)).toBe(0); // South should win
        });

        it('should correctly determine winner when non-leader plays highest card of lead suit', () => {
            const leadPlayerIndex = 1; // West leads
            const trickCards: Card[] = [
              { suit: 'clubs', rank: '2'}, // West (Leader)
              { suit: 'clubs', rank: 'A'}, // North (Plays Ace of Clubs)
              { suit: 'clubs', rank: '3'}, // East
              { suit: 'clubs', rank: '4'}  // South
            ];
            // North is player (1+1)%4 = 2. North played the 2nd card in trickCards (index 1).
            // Expected winner index: (leadPlayerIndex + highestCardIndexInTrickArray) % 4
            // (1 + 1) % 4 = 2
            expect(determineTrickWinner(trickCards, leadPlayerIndex)).toBe(2); // North should win
        });

        it('should correctly identify North (player 2) as winner when North leads and plays highest card', () => {
            const leadPlayerIndex = 2; // North leads (current S=0, W=1, N=2, E=3)
            const trickCards: Card[] = [
              { suit: 'hearts', rank: 'K'}, // North (Leader, plays King of Hearts)
              { suit: 'hearts', rank: '2'}, // East
              { suit: 'hearts', rank: '3'}, // South
              { suit: 'hearts', rank: '4'}  // West
            ];
            // North is player (2+0)%4 = 2. North played the 1st card (index 0).
            expect(determineTrickWinner(trickCards, leadPlayerIndex)).toBe(2); // North (player 2) should win
        });

        it('should correctly identify winner when lead suit is Spades and Queen of Spades is not highest', () => {
            const leadPlayerIndex = 0; // South leads
            const trickCards: Card[] = [
              { suit: 'spades', rank: 'K' }, // South (Leader)
              { suit: 'spades', rank: 'Q' }, // West (Queen of Spades)
              { suit: 'spades', rank: 'A' }, // North (Ace of Spades - wins)
              { suit: 'spades', rank: '2' }  // East
            ];
            // North played 3rd card (index 2). (0 + 2) % 4 = 2.
            expect(determineTrickWinner(trickCards, leadPlayerIndex)).toBe(2); // North should win
        });

        it('should handle scenario where players play off-suit (and lead suit wins)', () => {
            const leadPlayerIndex = 3; // East leads
            const trickCards: Card[] = [
              { suit: 'diamonds', rank: 'J'}, // East (Leader)
              { suit: 'spades', rank: 'A'},   // South (Off-suit, Ace of Spades)
              { suit: 'diamonds', rank: 'K'}, // West (Follows suit, King of Diamonds - wins)
              { suit: 'hearts', rank: 'Q'}    // North (Off-suit, Queen of Hearts)
            ];
            // West played 3rd card (index 2). (3 + 2) % 4 = 1.
            expect(determineTrickWinner(trickCards, leadPlayerIndex)).toBe(1); // West should win
        });

        it('DEBUG: North wins with Ace, but East (player 3) was reported as winner', () => {
            // This test models the reported bug scenario with S=0, W=1, N=2, E=3.
            // Let's assume North (player 2) leads the trick.
            const leadPlayerIndex = 2; // North leads.
            const trickCards: Card[] = [
              // Cards are in order of play: N, E, S, W
              { suit: 'spades', rank: 'A' }, // North's card (highest spade, should win)
              { suit: 'spades', rank: 'K' }, // East's card
              { suit: 'spades', rank: 'Q' }, // South's card
              { suit: 'spades', rank: 'J' }  // West's card
            ];
            // Expected: North (player 2) wins because they led and played the Ace (index 0 in trickCards).
            // (leadPlayerIndex + highestRankIndexInTrick) % 4 = (2 + 0) % 4 = 2.
            const winner = determineTrickWinner(trickCards, leadPlayerIndex);
            // You can add a console.log here if needed for debugging during test runs:
            // console.log(`[DEBUG TEST TS] leadPlayerIndex: ${leadPlayerIndex}, trickCards: ${JSON.stringify(trickCards)}, calculated winner: ${winner}`);
            expect(winner).toBe(2); // North (player 2) should win.
        });
    })

    describe('calculateScore', () => {
        it('should assign 1 point for each heart taken', () => {
            const tricks: Card[][][] = [
                // Player 0's tricks
                [
                    [
                        { suit: 'hearts', rank: '2' },
                        { suit: 'hearts', rank: '5' },
                        { suit: 'hearts', rank: '10' }
                    ]
                ],
                // Player 1's tricks (empty)
                [],
                // Player 2's tricks
                [
                    [
                        { suit: 'hearts', rank: 'K' },
                        { suit: 'hearts', rank: 'A' }
                    ]
                ],
                // Player 3's tricks (empty)
                []
            ];

            expect(calculateScore(tricks).scores).toEqual([3, 0, 2, 0]);
        });

        it('should assign 13 points for the queen of spades taken', () => {
            const tricks: Card[][][] = [
                // Player 0's tricks
                [],
                // Player 1's tricks with Queen of Spades
                [
                    [{ suit: 'spades', rank: 'Q' }]
                ],
                // Player 2's tricks (empty)
                [],
                // Player 3's tricks (empty)
                []
            ];

            expect(calculateScore(tricks).scores).toEqual([0, 13, 0, 0]);
        });

        it('should detect when a player has shot the moon and adjust scores accordingly', () => {
            // Create tricks where player 0 has all hearts and queen of spades
            const tricks: Card[][][] = [
                // Player 0's tricks - all hearts and queen of spades
                [
                    [
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
                        { suit: 'spades', rank: 'Q' }
                    ]
                ],
                // Player 1's tricks (empty)
                [],
                // Player 2's tricks (empty)
                [],
                // Player 3's tricks (empty)
                []
            ];

            // Calculate scores
            const result = calculateScore(tricks);

            // Check that player 0 is identified as shooting the moon
            expect(result.shootingPlayer).toBe(0);

            // Check that player 0's score is -26 (26 points subtracted)
            expect(result.scores).toEqual([-26, 0, 0, 0]);
        });

        it('should calculate scores correctly with Card[][][] structure', () => {
            const tricks: Card[][][] = [
                [], // Player 0
                [ // Player 1
                    [
                        { suit: 'hearts', rank: '2' },
                        { suit: 'hearts', rank: '3' },
                        { suit: 'hearts', rank: '4' },
                        { suit: 'spades', rank: 'Q' }
                    ] as Card[]
                ],
                [], // Player 2
                []  // Player 3
            ];
            const result = calculateScore(tricks);
            expect(result.scores).toEqual([0, 16, 0, 0]); // 3 hearts + 13 for Queen of Spades
        });

        it('should handle players with no tricks (undefined/null)', () => {
            const tricks: (Card[][] | undefined | null)[] = [
                [[{ suit: 'hearts', rank: '5' }]], // Player 0
                undefined, // Player 1
                [[{ suit: 'spades', rank: 'Q' }]], // Player 2
                null // Player 3
            ];
            const result = calculateScore(tricks as Card[][][]);
            expect(result.scores).toEqual([1, 0, 13, 0]);
        });
    })

    describe('checkGameEnd', () => {
        it('should return false if any player still has cards', () => {
            const playerHands: Card[][] = [
                [{ suit: 'clubs', rank: '2' } as Card],
                [],
                [{ suit: 'hearts', rank: 'A' } as Card],
                []
            ];
            expect(checkGameEnd(playerHands)).toBe(false);
        });

        it('should return true when all player hands are empty', () => {
            const playerHands: Card[][] = [[], [], [], []];
            expect(checkGameEnd(playerHands)).toBe(true);
        });
    });
})
