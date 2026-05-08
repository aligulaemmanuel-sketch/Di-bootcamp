import React from 'react';
import Car from './Components/Car';
import Events from './Components/Events';
import Phone from './Components/Phone';
import Color from './Components/Color';

function App() {
  const carinfo = { name: "Ford", model: "Mustang" };

  return (
    <div className="App">
      <h1>React Exercises</h1>
      <hr />
      <Car carInfo={carinfo} />
      <hr />
      <Events />
      <hr />
      <Phone />
      <hr />
      <Color />
    </div>
  );
}

export default App;
