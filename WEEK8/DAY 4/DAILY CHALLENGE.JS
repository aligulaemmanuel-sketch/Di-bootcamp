import React, { useState } from 'react';

const DailyChallenge = () => {
  // 1. State hooks to store user input and the result
  const [number1, setNumber1] = useState('');
  const [number2, setNumber2] = useState('');
  const [operation, setOperation] = useState('add');
  const [result, setResult] = useState(null);

  // 2. Logic to handle the calculation
  const handleCalculation = () => {
    // Convert string inputs to actual numbers
    const num1 = parseFloat(number1);
    const num2 = parseFloat(number2);

    // Basic validation to ensure inputs are numbers
    if (isNaN(num1) || isNaN(num2)) {
      setResult('Invalid Input');
      return;
    }

    let total;
    switch (operation) {
      case 'add':
        total = num1 + num2;
        break;
      case 'subtract':
        total = num1 - num2;
        break;
      case 'multiply':
        total = num1 * num2;
        break;
      case 'divide':
        total = num2 !== 0 ? num1 / num2 : 'Error (Div by 0)';
        break;
      default:
        total = 0;
    }

    setResult(total);
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Adding Two Numbers</h2>

      <div style={styles.inputWrapper}>
        {/* Input for first number */}
        <input
          type="number"
          placeholder="0"
          value={number1}
          onChange={(e) => setNumber1(e.target.value)}
          style={styles.inputField}
        />

        {/* Bonus: Select dropdown for operation */}
        <select 
          value={operation} 
          onChange={(e) => setOperation(e.target.value)}
          style={styles.selectField}
        >
          <option value="add">+</option>
          <option value="subtract">-</option>
          <option value="multiply">×</option>
          <option value="divide">÷</option>
        </select>

        {/* Input for second number */}
        <input
          type="number"
          placeholder="0"
          value={number2}
          onChange={(e) => setNumber2(e.target.value)}
          style={styles.inputField}
        />
      </div>

      <button onClick={handleCalculation} style={styles.calcButton}>
        Add Them!
      </button>

      {/* Result Display */}
      {result !== null && (
        <div style={styles.resultText}>
          {result}
        </div>
      )}
    </div>
  );
};

// Styles to mimic the UI in your image
const styles = {
  container: {
    backgroundColor: '#30135d', // Deep purple background
    minHeight: '300px',
    padding: '40px',
    borderRadius: '15px',
    textAlign: 'center',
    color: '#e0d1ff',
    fontFamily: 'Arial, sans-serif',
    maxWidth: '600px',
    margin: '50px auto'
  },
  title: {
    marginBottom: '30px',
    fontSize: '24px'
  },
  inputWrapper: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '15px',
    marginBottom: '30px'
  },
  inputField: {
    width: '140px',
    height: '80px',
    borderRadius: '10px',
    border: 'none',
    fontSize: '48px',
    textAlign: 'center',
    backgroundColor: '#c8b1ff', // Light purple input
    color: '#30135d'
  },
  selectField: {
    padding: '10px',
    fontSize: '20px',
    borderRadius: '8px',
    cursor: 'pointer'
  },
  calcButton: {
    backgroundColor: '#6222cc', // Bright purple button
    color: 'white',
    padding: '15px 40px',
    fontSize: '18px',
    border: 'none',
    borderRadius: '20px',
    cursor: 'pointer',
    transition: '0.2s'
  },
  resultText: {
    fontSize: '100px',
    fontWeight: 'bold',
    marginTop: '30px',
    color: 'white'
  }
};

export default DailyChallenge;