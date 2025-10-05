import { describe, it, expect } from 'vitest'
import { gameReducer, initialGameState } from './useGameReducer'
import { player0HasTwoOfClubs } from '../../test/fixtures/hands'

describe('useGameReducer', () => {
  describe('DEAL_CARDS', () => {
    it('should set player hands and find starting player', () => {
      const state = gameReducer(initialGameState, {
        type: 'DEAL_CARDS',
        payload: { hands: player0HasTwoOfClubs }
      })

      expect(state.playerHands).toEqual(player0HasTwoOfClubs)
      expect(state.gamePhase).toBe('PLAYING')
      expect(state.currentTurn).toBe(0) // Player 0 has 2 of clubs
      expect(state.trickCards).toEqual([])
      expect(state.showCompletedTrick).toBe(false)
    })

    it('should reset round scores when dealing', () => {
      const state = gameReducer(initialGameState, {
        type: 'DEAL_CARDS',
        payload: { hands: player0HasTwoOfClubs }
      })

      expect(state.roundScores).toEqual([0, 0, 0, 0])
      expect(state.previousScores).toEqual([0, 0, 0, 0])
    })
  })

  describe('PLAY_CARD', () => {
    it('should add card to trick and remove from hand', () => {
      const initialState = gameReducer(initialGameState, {
        type: 'DEAL_CARDS',
        payload: { hands: player0HasTwoOfClubs }
      })

      const card = player0HasTwoOfClubs[0][0] // 2 of clubs
      const state = gameReducer(initialState, {
        type: 'PLAY_CARD',
        payload: { playerIndex: 0, card }
      })

      expect(state.trickCards).toHaveLength(1)
      expect(state.trickCards[0]).toEqual(card)
      expect(state.trickPlayerIndices).toEqual([0])
      expect(state.playerHands[0]).toHaveLength(12) // One card removed
      expect(state.currentTurn).toBe(1) // Next player's turn
    })

    it('should set gamePhase to TRICK_COMPLETE when 4 cards played', () => {
      let state = gameReducer(initialGameState, {
        type: 'DEAL_CARDS',
        payload: { hands: player0HasTwoOfClubs }
      })

      // Play 4 cards
      for (let i = 0; i < 4; i++) {
        const card = state.playerHands[state.currentTurn][0]
        state = gameReducer(state, {
          type: 'PLAY_CARD',
          payload: { playerIndex: state.currentTurn, card }
        })
      }

      expect(state.gamePhase).toBe('TRICK_COMPLETE')
      expect(state.trickCards).toHaveLength(4)
      expect(state.isProcessing).toBe(true)
    })

    it('should break hearts when heart is played', () => {
      const initialState = gameReducer(initialGameState, {
        type: 'DEAL_CARDS',
        payload: { hands: player0HasTwoOfClubs }
      })

      const heartCard = { suit: 'hearts' as const, rank: 'J' as const }
      const state = gameReducer(initialState, {
        type: 'PLAY_CARD',
        payload: { playerIndex: 0, card: heartCard }
      })

      expect(state.heartsBroken).toBe(true)
    })

    it('should reject card play when not player turn', () => {
      const initialState = gameReducer(initialGameState, {
        type: 'DEAL_CARDS',
        payload: { hands: player0HasTwoOfClubs }
      })

      const card = player0HasTwoOfClubs[1][0]
      const state = gameReducer(initialState, {
        type: 'PLAY_CARD',
        payload: { playerIndex: 1, card } // Player 1, but it's player 0's turn
      })

      expect(state).toEqual(initialState) // State unchanged
    })
  })

  describe('COMPLETE_TRICK', () => {
    it('should update scores and set showCompletedTrick', () => {
      const state = gameReducer(initialGameState, {
        type: 'COMPLETE_TRICK',
        payload: { winner: 1, points: 5 }
      })

      expect(state.scores[1]).toBe(5)
      expect(state.roundScores[1]).toBe(5)
      expect(state.showCompletedTrick).toBe(true)
      expect(state.gamePhase).toBe('PLAYING')
    })

    it('should accumulate round scores across tricks', () => {
      let state = gameReducer(initialGameState, {
        type: 'COMPLETE_TRICK',
        payload: { winner: 1, points: 5 }
      })

      state = gameReducer(state, {
        type: 'COMPLETE_TRICK',
        payload: { winner: 1, points: 3 }
      })

      expect(state.scores[1]).toBe(8)
      expect(state.roundScores[1]).toBe(8)
    })
  })

  describe('START_NEW_TRICK', () => {
    it('should clear trick cards and set new lead player', () => {
      const initialState = {
        ...initialGameState,
        trickCards: [{ suit: 'clubs' as const, rank: '2' as const }],
        trickPlayerIndices: [0],
        showCompletedTrick: true,
      }

      const state = gameReducer(initialState, {
        type: 'START_NEW_TRICK',
        payload: { leadPlayer: 2 }
      })

      expect(state.currentTurn).toBe(2)
      expect(state.trickCards).toEqual([])
      expect(state.trickPlayerIndices).toEqual([])
      expect(state.showCompletedTrick).toBe(false)
      expect(state.gamePhase).toBe('PLAYING')
    })
  })

  describe('COMPLETE_ROUND', () => {
    it('should set gamePhase to ROUND_COMPLETE and calculate round scores', () => {
      const initialState = {
        ...initialGameState,
        scores: [26, 15, 20, 18],
        previousScores: [0, 0, 0, 0],
      }

      const state = gameReducer(initialState, {
        type: 'COMPLETE_ROUND'
      })

      expect(state.gamePhase).toBe('ROUND_COMPLETE')
      expect(state.roundScores).toEqual([26, 15, 20, 18])
      expect(state.showCompletedTrick).toBe(false)
    })

    it('should set gameOver when score >= 100', () => {
      const initialState = {
        ...initialGameState,
        scores: [105, 87, 92, 78],
        previousScores: [79, 72, 72, 60],
      }

      const state = gameReducer(initialState, {
        type: 'COMPLETE_ROUND'
      })

      expect(state.gameOver).toBe(true)
      expect(state.gamePhase).toBe('ROUND_COMPLETE')
    })
  })

  describe('SHOW_SCORE_SCREEN', () => {
    it('should show score screen and hide completed trick', () => {
      const initialState = {
        ...initialGameState,
        showCompletedTrick: true,
      }

      const state = gameReducer(initialState, {
        type: 'SHOW_SCORE_SCREEN'
      })

      expect(state.showScoreScreen).toBe(true)
      expect(state.showCompletedTrick).toBe(false)
    })
  })

  describe('NEXT_ROUND', () => {
    it('should reset for next round and increment round number', () => {
      const initialState = {
        ...initialGameState,
        playerHands: player0HasTwoOfClubs,
        scores: [26, 15, 20, 18],
        roundScores: [26, 15, 20, 18],
        roundNumber: 1,
        showScoreScreen: true,
      }

      const state = gameReducer(initialState, {
        type: 'NEXT_ROUND'
      })

      expect(state.playerHands).toEqual([])
      expect(state.gamePhase).toBe('DEALING')
      expect(state.showScoreScreen).toBe(false)
      expect(state.roundNumber).toBe(2)
      expect(state.scores).toEqual([26, 15, 20, 18]) // Scores persist
    })
  })

  describe('NEW_GAME', () => {
    it('should reset to initial state', () => {
      const dirtyState = {
        ...initialGameState,
        playerHands: player0HasTwoOfClubs,
        scores: [26, 15, 20, 18],
        roundNumber: 5,
        gameOver: true,
      }

      const state = gameReducer(dirtyState, {
        type: 'NEW_GAME'
      })

      expect(state).toEqual(initialGameState)
    })
  })
})
