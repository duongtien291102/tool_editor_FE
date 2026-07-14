import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'dark' | 'light' | 'system';
export type Density = 'compact' | 'comfortable';

interface ThemeProviderState {
  theme: Theme;
  accentColor: string;
  density: Density;
  fontScale: number;
  setTheme: (theme: Theme) => void;
  setAccentColor: (color: string) => void;
  setDensity: (density: Density) => void;
  setFontScale: (scale: number) => void;
}

const initialState: ThemeProviderState = {
  theme: 'dark',
  accentColor: 'blue',
  density: 'compact',
  fontScale: 1,
  setTheme: () => null,
  setAccentColor: () => null,
  setDensity: () => null,
  setFontScale: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark');
  const [accentColor, setAccentColor] = useState('blue');
  const [density, setDensity] = useState<Density>('compact');
  const [fontScale, setFontScale] = useState(1);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark', 'compact', 'comfortable');
    
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
    
    root.classList.add(density);
    root.style.setProperty('--font-scale', fontScale.toString());
  }, [theme, density, fontScale, accentColor]);

  return (
    <ThemeProviderContext.Provider value={{ theme, accentColor, density, fontScale, setTheme, setAccentColor, setDensity, setFontScale }}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeProviderContext);
