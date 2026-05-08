import React, { Component } from 'react';

// --- EXERCISE 2 COMPONENT ---
class UserFavoriteAnimals extends Component {
  render() {
    const { favAnimals } = this.props;
    return (
      <div>
        <h3>Favorite Animals:</h3>
        <ul>
          {favAnimals.map((animal, index) => (
            <li key={index}>{animal}</li>
          ))}
        </ul>
      </div>
    );
  }
}

// --- EXERCISE 3 COMPONENT ---
class Exercise extends Component {
  render() {
    // Style Object for Part II
    const style_header = {
      color: "white",
      backgroundColor: "DodgerBlue",
      padding: "10px",
      fontFamily: "Arial"
    };

    // Style Object for Part III (Replacing Exercise.css)
    const paraStyle = {
      backgroundColor: "#282c34",
      color: "white",
      padding: "40px",
      fontFamily: "Arial",
      textAlign: "center"
    };

    return (
      <div style={{ textAlign: 'center' }}>
        <h1 style={style_header}>Exercise 3: HTML Tags & Styling</h1>
        
        <p style={paraStyle}>This paragraph is styled using a JS object instead of CSS.</p>
        
        <a href="https://reactjs.org">Click here to learn React</a>
        
        <form style={{ margin: '20px' }}>
          <input type="text" placeholder="Enter name" />
          <button type="submit">Submit</button>
        </form>
        
        <img 
          src="https://logo.clearbit.com/reactjs.org" 
          alt="React Logo" 
          style={{ width: '100px' }} 
        />
        
        <ul style={{ listStylePosition: 'inside' }}>
          <li>Feature A</li>
          <li>Feature B</li>
          <li>Feature C</li>
        </ul>
      </div>
    );
  }
}

// --- MAIN APP COMPONENT (EXERCISE 1 & INTEGRATION) ---
function App() {
  // Exercise 1 Variables
  const myelement = <h1>I Love JSX!</h1>;
  const sum = 5 + 5;

  // Exercise 2 Data
  const user = {
    firstName: 'Bob',
    lastName: 'Dylan',
    favAnimals: ['Horse', 'Turtle', 'Elephant', 'Monkey']
  };

  return (
    <div className="App" style={{ padding: '20px' }}>
      {/* Exercise 1 */}
      <section>
        <p>Hello World!</p>
        {myelement}
        <p>React is {sum} times better with JSX</p>
      </section>

      <hr />

      {/* Exercise 2 */}
      <section>
        <h3>{user.firstName}</h3>
        <h3>{user.lastName}</h3>
        <UserFavoriteAnimals favAnimals={user.favAnimals} />
      </section>

      <hr />

      {/* Exercise 3 */}
      <section>
        <Exercise />
      </section>
    </div>
  );
}

export default App;