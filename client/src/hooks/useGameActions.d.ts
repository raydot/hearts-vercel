import { Card } from '../types';

export interface GameActions {
  dealCards: () => void;
  handleComputerTurn: () => void;
  handleNextRound: () => void;
  handleNewGame: () => void;
  handleTrickCompletion: (completedTrickCards: Card[], playerIndices: number[]) => void;
}

export function useGameActions(): GameActions;
