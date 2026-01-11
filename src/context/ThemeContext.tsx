import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type ThemeVariant = 'red' | 'yellow' | 'black';

interface ThemeContextType {
  theme: ThemeVariant;
  setTheme: (theme: ThemeVariant) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<ThemeVariant>(() => {
    const saved = localStorage.getItem('theme-variant');
    return (saved as ThemeVariant) || 'red';
  });

  useEffect(() => {
    localStorage.setItem('theme-variant', theme);
    
    // Remove all theme classes and add current one
    document.documentElement.classList.remove('theme-red', 'theme-yellow', 'theme-black');
    document.documentElement.classList.add(`theme-${theme}`);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
