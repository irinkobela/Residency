import { useEffect } from 'react';
import useLocalStorage from './useLocalStorage';

export default function useTheme() {
  const [isDarkMode, setIsDarkMode] = useLocalStorage('darkMode', false);
  const [fontSize, setFontSize] = useLocalStorage('fontSize', 16);

  useEffect(() => {
    document.documentElement.classList.toggle('dark-mode', isDarkMode);
  }, [isDarkMode]);

  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}px`;
  }, [fontSize]);

  return { isDarkMode, setIsDarkMode, fontSize, setFontSize };
}