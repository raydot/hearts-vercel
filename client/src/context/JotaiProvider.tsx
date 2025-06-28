import React from 'react';
import { Provider } from 'jotai';

interface JotaiProviderProps {
  children: React.ReactNode;
}

// This component wraps the entire app with Jotai's Provider
const JotaiProvider: React.FC<JotaiProviderProps> = ({ children }) => {
  return (
    <Provider>
      {children}
    </Provider>
  );
};

export default JotaiProvider;
