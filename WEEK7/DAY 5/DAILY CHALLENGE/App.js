import React, { useState } from 'react';
import './App.css';

function App() {
  // 1. Initialize State
  const [languages, setLanguages] = useState([
    { name: "Php", votes: 0 },
    { name: "Python", votes: 0 },
    { name: "JavaSript", votes: 0 },
    { name: "Java", votes: 0 }
  ]);

  // 2. Voting Function
  const handleVote = (index) => {
    const newLanguages = [...languages];
    newLanguages[index].votes += 1;
    setLanguages(newLanguages);
  };

  return (
    <div className="container">
      <h1>Vote Your Language!</h1>
      <div className="vote-list">
        {languages.map((lang, index) => (
          <div key={index} className="vote-item">
            <span className="count">{lang.votes}</span>
            <span className="name">{lang.name}</span>
            <button onClick={() => handleVote(index)}>Click Here</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
