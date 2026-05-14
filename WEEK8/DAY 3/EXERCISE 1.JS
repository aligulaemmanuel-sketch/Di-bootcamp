import React, { createContext, useState, useContext } from 'react';

// --- 1. CONTEXT SETUP ---
// We create the context here so it can be accessed by any child component
const ThemeContext = createContext();

const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// --- 2. COMPONENTS ---

const ThemeSwitcher = () => {
  // Use the useContext hook to grab the toggle function and current theme
  const { theme, toggleTheme } = useContext(ThemeContext);
  
  return (
    <button 
      onClick={toggleTheme}
      style={{
        padding: '10px 20px',
        cursor: 'pointer',
        borderRadius: '8px',
        border: 'none',
        backgroundColor: theme === 'light' ? '#333' : '#eee',
        color: theme === 'light' ? '#fff' : '#000',
        fontWeight: 'bold'
      }}
    >
      Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode
    </button>
  );
};

const DisplayBoard = () => {
  const { theme } = useContext(ThemeContext);
  
  const containerStyle = {
    backgroundColor: theme === 'light' ? '#ffffff' : '#1a1a1a',
    color: theme === 'light' ? '#1a1a1a' : '#ffffff',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.4s ease'
  };

  return (
    <div style={containerStyle}>
      <h1>{theme.toUpperCase()} MODE</h1>
      <p>The context is currently providing the <strong>{theme}</strong> theme.</p>
      <ThemeSwitcher />
    </div>
  );
};

// --- 3. MAIN APP ---
export default function App() {
  return (
    // Everything inside ThemeProvider has access to the theme state
    <ThemeProvider>
      <DisplayBoard />
    </ThemeProvider>
  );
}