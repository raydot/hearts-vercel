import { useState, useEffect, useRef } from 'react';
import { useAtom } from 'jotai';
import { Atom } from 'jotai';

// This hook bridges React's useState and Jotai atoms
// It allows us to gradually migrate state while maintaining compatibility
export function useJotaiState<T>(atom: Atom<T>, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  // Use both useState and useAtom
  const [reactState, setReactState] = useState<T>(initialValue);
  const [jotaiState, setJotaiState] = useAtom(atom);
  
  // Use refs to track if changes are coming from internal updates
  const isUpdatingReact = useRef(false);
  const isUpdatingJotai = useRef(false);
  
  // Keep the Jotai state in sync with React state
  useEffect(() => {
    // Only update Jotai if the change didn't come from Jotai itself
    if (!isUpdatingReact.current) {
      isUpdatingJotai.current = true;
      setJotaiState(reactState);
      // Reset the flag after the update
      setTimeout(() => {
        isUpdatingJotai.current = false;
      }, 0);
    }
  }, [reactState, setJotaiState]);
  
  // Keep the React state in sync with Jotai state
  useEffect(() => {
    // Only update React if the change didn't come from React itself
    if (!isUpdatingJotai.current) {
      isUpdatingReact.current = true;
      setReactState(jotaiState);
      // Reset the flag after the update
      setTimeout(() => {
        isUpdatingReact.current = false;
      }, 0);
    }
  }, [jotaiState]);
  
  // Create a wrapped setter that updates both states
  const setStateWrapper = (value: T | ((prev: T) => T)) => {
    setReactState(value);
  };
  
  // Return the React state and the wrapped setter
  return [reactState, setStateWrapper];
}
