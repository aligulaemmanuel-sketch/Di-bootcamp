import React, { useRef, useState } from 'react';

const CharacterCounter = () => {
  const inputRef = useRef(null);
  // We use a small state just to trigger a re-render so the UI updates
  const [count, setCount] = useState(0);

  const handleInput = () => {
    // Access the DOM element directly via inputRef.current
    const length = inputRef.current.value.length;
    setCount(length);
  };

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>Character Counter</h2>
      <textarea
        ref={inputRef}
        onInput={handleInput}
        placeholder="Type something..."
        rows="5"
        style={{ width: '300px', padding: '10px' }}
      />
      <p style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
        Character Count: {count}
      </p>
    </div>
  );
};

export default CharacterCounter;