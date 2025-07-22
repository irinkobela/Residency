import React, { createContext, useContext } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';

const ShortcutContext = createContext();

export const useShortcuts = () => useContext(ShortcutContext);

export const ShortcutProvider = ({ children }) => {
  const [shortcutPrev, setShortcutPrev] = useLocalStorage('shortcutPrev', 'ArrowLeft');
  const [shortcutNext, setShortcutNext] = useLocalStorage('shortcutNext', 'ArrowRight');
  const [shortcutExplanation, setShortcutExplanation] = useLocalStorage('shortcutExplanation', ' ');

  const value = {
    shortcutPrev,
    setShortcutPrev,
    shortcutNext,
    setShortcutNext,
    shortcutExplanation,
    setShortcutExplanation,
  };

  return (
    <ShortcutContext.Provider value={value}>
      {children}
    </ShortcutContext.Provider>
  );
};
