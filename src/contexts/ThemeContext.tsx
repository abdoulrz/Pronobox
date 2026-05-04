import React, {
  useEffect,
  useState,
  createContext,
  useContext } from 'react';
interface ThemeContextType {
  theme: 'light' | 'dark';
  accentColor: string;
  toggleTheme: () => void;
  setAccentColor: (color: string) => void;
}
const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  accentColor: '#10b981',
  toggleTheme: () => {},
  setAccentColor: () => {}
});
export const useTheme = () => useContext(ThemeContext);
export const ThemeProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  // Check if dark mode is saved in localStorage or prefer-color-scheme
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initialTheme = savedTheme ?
  savedTheme as 'light' | 'dark' :
  prefersDark ?
  'dark' :
  'light';
  const [theme, setTheme] = useState<'light' | 'dark'>(initialTheme);
  const [accentColor, setAccentColor] = useState<string>(
    localStorage.getItem('accentColor') || '#10b981'
  );
  useEffect(() => {
    // Apply theme to document
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    // Save theme preference
    localStorage.setItem('theme', theme);
  }, [theme]);
  useEffect(() => {
    // Apply accent color as CSS variables
    document.documentElement.style.setProperty('--accent-color', accentColor);
    document.documentElement.style.setProperty(
      '--accent-color-light',
      `${accentColor}20`
    );
    // Save accent color preference
    localStorage.setItem('accentColor', accentColor);
    // Apply theme-specific classes
    const root = document.documentElement;
    root.style.setProperty(
      '--theme-primary-bg',
      theme === 'dark' ? '#1f2937' : '#ffffff'
    );
    root.style.setProperty(
      '--theme-secondary-bg',
      theme === 'dark' ? '#111827' : '#f9fafb'
    );
    root.style.setProperty(
      '--theme-primary-text',
      theme === 'dark' ? '#f9fafb' : '#111827'
    );
    root.style.setProperty(
      '--theme-secondary-text',
      theme === 'dark' ? '#d1d5db' : '#4b5563'
    );
    // Appliquer des couleurs spécifiques pour le mode sombre
    if (theme === 'dark') {
      root.style.setProperty('--theme-card-bg', '#1f2937');
      root.style.setProperty('--theme-card-border', '#374151');
      root.style.setProperty('--theme-input-bg', '#374151');
      root.style.setProperty('--theme-input-text', '#f9fafb');
      root.style.setProperty('--theme-button-hover', '#2d3748');
    } else {
      root.style.setProperty('--theme-card-bg', '#ffffff');
      root.style.setProperty('--theme-card-border', '#e5e7eb');
      root.style.setProperty('--theme-input-bg', '#ffffff');
      root.style.setProperty('--theme-input-text', '#111827');
      root.style.setProperty('--theme-button-hover', '#f3f4f6');
    }
    // Apply CSS for theme color classes
    const style = document.createElement('style');
    style.innerHTML = `
      .theme-bg-primary {
        background-color: ${theme === 'dark' ? '#10b981' : accentColor};
      }
      .theme-text-primary {
        color: ${theme === 'dark' ? '#34d399' : accentColor};
      }
      .theme-border-primary {
        border-color: ${theme === 'dark' ? '#34d399' : accentColor};
      }
      /* Styles améliorés pour le mode sombre */
      ${
    theme === 'dark' ?
    `
        .dark-card {
          background-color: #1f2937;
          border-color: #374151;
        }
        .dark-input {
          background-color: #374151;
          border-color: #4b5563;
          color: #f9fafb;
        }
        .dark-button {
          background-color: #374151;
          color: #f9fafb;
        }
        .dark-button:hover {
          background-color: #4b5563;
        }
        .dark-text-primary {
          color: #34d399;
        }
        .dark-bg-surface {
          background-color: #111827;
        }
      ` :
    ''}
    `;

    // Replace existing style if it exists
    const existingStyle = document.getElementById('theme-dynamic-styles');
    if (existingStyle) {
      existingStyle.innerHTML = style.innerHTML;
    } else {
      style.id = 'theme-dynamic-styles';
      document.head.appendChild(style);
    }
  }, [theme, accentColor]);
  const toggleTheme = () => {
    setTheme((prevTheme) => prevTheme === 'light' ? 'dark' : 'light');
  };
  return (
    <ThemeContext.Provider
      value={{
        theme,
        accentColor,
        toggleTheme,
        setAccentColor
      }}>

      {children}
    </ThemeContext.Provider>);

};