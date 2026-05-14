import React, { useState } from 'react';

// This is the data structure based on your instructions. 
// If you have an external JSON file, import it as: import quotes from './quotes.json';
const quotes = [
  { "quote": "From error to error one discovers the entire truth.", "author": "Sigmund Freud" },
  { "quote": "The only way to do great work is to love what you do.", "author": "Steve Jobs" },
  { "quote": "Life is what happens when you're busy making other plans.", "author": "John Lennon" },
  { "quote": "Reality is merely an illusion, albeit a very persistent one.", "author": "Albert Einstein" },
  { "quote": "Knowledge speaks, but wisdom listens.", "author": "Jimi Hendrix" }
];

const colors = [
  '#16a085', '#27ae60', '#2c3e50', '#f39c12', '#e74c3c', 
  '#9b59b6', '#FB6964', '#342224', '#472E32', '#BDBB99'
];

const Exercise = () => {
  // 1. Initialize state with a random index
  const [index, setIndex] = useState(Math.floor(Math.random() * quotes.length));
  const [accentColor, setAccentColor] = useState(colors[Math.floor(Math.random() * colors.length)]);

  const handleNewQuote = () => {
    // Generate a new index that isn't the same as the current one
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * quotes.length);
    } while (newIndex === index);

    // Pick a random color
    const newColor = colors[Math.floor(Math.random() * colors.length)];

    // 2. Update state to trigger re-render
    setIndex(newIndex);
    setAccentColor(newColor);
  };

  const currentQuote = quotes[index];

  // 3. Define dynamic styles
  const mainStyle = {
    backgroundColor: accentColor,
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    transition: 'background-color 0.5s ease'
  };

  const cardStyle = {
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '8px',
    width: '450px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
    textAlign: 'center'
  };

  return (
    <div style={mainStyle}>
      <div style={cardStyle}>
        <h2 style={{ color: accentColor, transition: 'color 0.5s ease', margin: '0 0 20px 0' }}>
          "{currentQuote.quote}"
        </h2>
        
        <p style={{ color: accentColor, fontStyle: 'italic', textAlign: 'right' }}>
          - {currentQuote.author} -
        </p>

        <div style={{ textAlign: 'right', marginTop: '30px' }}>
          <button 
            onClick={handleNewQuote}
            style={{ 
              backgroundColor: accentColor, 
              color: 'white', 
              border: 'none', 
              padding: '10px 20px', 
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '1rem',
              transition: 'background-color 0.5s ease'
            }}
          >
            New quote
          </button>
        </div>
      </div>
    </div>
  );
};

export default Exercise;