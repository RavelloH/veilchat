import { useContext } from 'react';
import { ThemeContext } from '../pages/_app';

export function useTheme() {
  return useContext(ThemeContext);
}
