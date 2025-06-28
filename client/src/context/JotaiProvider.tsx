import React from 'react';
import { Provider } from 'jotai';
import GameStateProvider from './GameStateProvider';

interface JotaiProviderProps {
  children: React.ReactNode;
}

// This component wraps the entire app with Jotai's Provider
// while keeping the existing GameStateProvider intact
const JotaiProvider: React.FC<JotaiProviderProps> = ({ children }) => {
  return (
    <Provider>
      <GameStateProvider>
        {children}
      </GameStateProvider>
    </Provider>
  );
};

export default JotaiProvider;
