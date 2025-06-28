import { createContext } from 'react';
import { GameStateContextType } from '@/types';

// Create the context with a default undefined value
export const GameStateContext = createContext<GameStateContextType | undefined>(undefined);
