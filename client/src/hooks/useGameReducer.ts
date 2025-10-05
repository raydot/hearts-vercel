import { Card } from '@/types/index';
import { findStartingPlayer } from '@/engine/gameEngine';

// Game State Type
export interface GameState {
  playerHands: Card[][];
  currentTurn: number;
  trickCards: Card[];
  trickPlayerIndices: number[];
  gamePhase: 'DEALING' | 'PLAYING' | 'TRICK_COMPLETE' | 'ROUND_COMPLETE' | 'GAME_OVER';
  heartsBroken: boolean;
  scores: number[];
  roundScores: number[]; // Points earned this round
  previousScores: number[]; // Scores at start of round
  gameOver: boolean;
  showCompletedTrick: boolean;
  showScoreScreen: boolean;
  isProcessing: boolean; // Prevents multiple actions during processing
}

// Action Types
export type GameAction =
  | { type: 'DEAL_CARDS'; payload: { hands: Card[][] } }
  | { type: 'PLAY_CARD'; payload: { playerIndex: number; card: Card } }
  | { type: 'COMPLETE_TRICK'; payload: { winner: number; points: number } }
  | { type: 'START_NEW_TRICK'; payload: { leadPlayer: number } }
  | { type: 'COMPLETE_ROUND' }
  | { type: 'SHOW_SCORE_SCREEN' }
  | { type: 'NEXT_ROUND' }
  | { type: 'NEW_GAME' }
  | { type: 'SET_PROCESSING'; payload: { isProcessing: boolean } }
  | { type: 'SHOW_COMPLETED_TRICK'; payload: { show: boolean } };

// Initial State
export const initialGameState: GameState = {
  playerHands: [],
  currentTurn: 0,
  trickCards: [],
  trickPlayerIndices: [],
  gamePhase: 'DEALING',
  heartsBroken: false,
  scores: [0, 0, 0, 0],
  roundScores: [0, 0, 0, 0],
  previousScores: [0, 0, 0, 0],
  gameOver: false,
  showCompletedTrick: false,
  showScoreScreen: false,
  isProcessing: false,
};

// Reducer Function
export function gameReducer(state: GameState, action: GameAction): GameState {
  console.log('gameReducer:', action.type, 'payload' in action ? action.payload : 'no payload');
  
  // Prevent actions during processing (except SET_PROCESSING and COMPLETE_TRICK)
  if (state.isProcessing && action.type !== 'SET_PROCESSING' && action.type !== 'COMPLETE_TRICK') {
    console.log('gameReducer: Action blocked - currently processing');
    return state;
  }

  switch (action.type) {
    case 'DEAL_CARDS':
      console.log('gameReducer DEAL_CARDS: received hands:', action.payload.hands);
      console.log('gameReducer DEAL_CARDS: hands type:', typeof action.payload.hands, 'length:', action.payload.hands?.length);
      if (action.payload.hands && action.payload.hands.length > 0) {
        console.log('gameReducer DEAL_CARDS: First hand:', action.payload.hands[0]);
      }
      const startingPlayer = findStartingPlayer(action.payload.hands);
      console.log('gameReducer DEAL_CARDS: Starting player (has 2 of clubs):', startingPlayer);
      return {
        ...state,
        playerHands: action.payload.hands,
        currentTurn: startingPlayer,
        trickCards: [],
        trickPlayerIndices: [],
        gamePhase: 'PLAYING',
        heartsBroken: false,
        showCompletedTrick: false,
        previousScores: state.scores, // Save current scores before new round
        roundScores: [0, 0, 0, 0], // Reset round scores
        isProcessing: false,
      };

    case 'PLAY_CARD': {
      const { playerIndex, card } = action.payload;
      
      // Validate: Check if it's the player's turn
      if (playerIndex !== state.currentTurn) {
        console.log(`gameReducer: Not player ${playerIndex}'s turn (current: ${state.currentTurn})`);
        return state;
      }
      
      // Validate: Check if trick is full
      if (state.trickCards.length >= 4) {
        console.log('gameReducer: Trick already full, cannot play card');
        return state;
      }
      
      // Validate: Check if player has the card
      const playerHand = state.playerHands[playerIndex];
      const cardIndex = playerHand.findIndex(c => c.suit === card.suit && c.rank === card.rank);
      if (cardIndex === -1) {
        console.log(`gameReducer: Player ${playerIndex} doesn't have ${card.rank} of ${card.suit}`);
        return state;
      }
      
      // Remove card from hand
      const newPlayerHands = [...state.playerHands];
      newPlayerHands[playerIndex] = playerHand.filter((_, i) => i !== cardIndex);
      
      // Add card to trick
      const newTrickCards = [...state.trickCards, card];
      const newTrickPlayerIndices = [...state.trickPlayerIndices, playerIndex];
      
      // Check if hearts broken
      const newHeartsBroken = state.heartsBroken || card.suit === 'hearts';
      
      // Determine next turn and game phase
      const nextTurn = (state.currentTurn + 1) % 4;
      const isTrickComplete = newTrickCards.length === 4;
      
      return {
        ...state,
        playerHands: newPlayerHands,
        currentTurn: nextTurn,
        trickCards: newTrickCards,
        trickPlayerIndices: newTrickPlayerIndices,
        heartsBroken: newHeartsBroken,
        gamePhase: isTrickComplete ? 'TRICK_COMPLETE' : 'PLAYING',
        isProcessing: isTrickComplete, // Block further actions until trick is processed
      };
    }

    case 'COMPLETE_TRICK': {
      const { winner, points } = action.payload;
      
      // Update scores
      const newScores = [...state.scores];
      newScores[winner] += points;
      
      // Always show the completed trick first
      // Round completion will be checked after the trick display
      return {
        ...state,
        scores: newScores,
        gamePhase: 'PLAYING',
        showCompletedTrick: true,
        isProcessing: false,
      };
    }

    case 'START_NEW_TRICK': {
      const { leadPlayer } = action.payload;
      
      return {
        ...state,
        currentTurn: leadPlayer,
        trickCards: [],
        trickPlayerIndices: [],
        gamePhase: 'PLAYING',
        showCompletedTrick: false,
        isProcessing: false,
      };
    }

    case 'COMPLETE_ROUND': {
      // Calculate round scores (points earned this round)
      const roundScores = state.scores.map((score, i) => score - state.previousScores[i]);
      const gameOver = state.scores.some(score => score >= 100);
      
      return {
        ...state,
        roundScores,
        gamePhase: 'ROUND_COMPLETE',
        gameOver,
        showCompletedTrick: false,
        showScoreScreen: false, // Will be shown after a brief delay
        isProcessing: false,
      };
    }

    case 'SET_PROCESSING':
      return {
        ...state,
        isProcessing: action.payload.isProcessing,
      };

    case 'SHOW_COMPLETED_TRICK':
      return {
        ...state,
        showCompletedTrick: action.payload.show,
      };

    case 'SHOW_SCORE_SCREEN':
      return {
        ...state,
        showScoreScreen: true,
        showCompletedTrick: false,
      };

    case 'NEXT_ROUND':
      return {
        ...state,
        playerHands: [],
        currentTurn: 0,
        trickCards: [],
        trickPlayerIndices: [],
        gamePhase: 'DEALING',
        heartsBroken: false,
        showCompletedTrick: false,
        showScoreScreen: false,
        isProcessing: false,
      };

    case 'NEW_GAME':
      return {
        ...initialGameState,
      };

    default:
      return state;
  }
}
