import { atom } from 'jotai';
import { Card } from '../types';

// Game state types
export type GamePhase = 'DEALING' | 'PLAYING' | 'TRICK_COMPLETED' | 'ROUND_ENDED' | 'SCORE_SCREEN' | 'GAME_OVER';

// Basic game state atoms
export const gamePhaseAtom = atom<GamePhase>('DEALING');
export const currentRoundAtom = atom<number>(1);
export const gameOverAtom = atom<boolean>(false);

// Player state atoms
export const playerHandsAtom = atom<Card[][]>([[], [], [], []]);
export const currentTurnAtom = atom<number>(0); // 0 = South (human), 1 = West, 2 = North, 3 = East
export const leadPlayerAtom = atom<number>(0);

// Trick state atoms
export const trickCardsAtom = atom<Card[]>([]);
export const trickPlayerIndicesAtom = atom<number[]>([]);
export const tricksAtom = atom<Card[][][]>([[], [], [], []]);
export const heartsBrokenAtom = atom<boolean>(false);

// Animation state atoms
export const isProcessingTrickEndAtom = atom<boolean>(false);
export const isClearingTrickAtom = atom<boolean>(false);
export const trickAnimationTargetPlayerAtom = atom<number | null>(null);

// Score state atoms
export const roundScoresAtom = atom<number[]>([0, 0, 0, 0]);
export const totalScoresAtom = atom<number[]>([0, 0, 0, 0]);
export const shootingPlayerAtom = atom<number | null>(null);
export const showScoreScreenAtom = atom<boolean>(false);

// Derived atoms
export const isHandOverAtom = atom(
  (get) => get(playerHandsAtom).every(hand => hand.length === 0)
);

export const isFinalTrickAtom = atom(
  (get) => {
    const playerHands = get(playerHandsAtom);
    // Final trick is when all players have exactly 1 card left
    return playerHands.every(hand => hand.length === 1);
  }
);

export const isLastTrickCompleteAtom = atom(
  (get) => {
    const isHandOver = get(isHandOverAtom);
    const trickPlayerIndices = get(trickPlayerIndicesAtom);
    return isHandOver && trickPlayerIndices.length === 4;
  }
);
