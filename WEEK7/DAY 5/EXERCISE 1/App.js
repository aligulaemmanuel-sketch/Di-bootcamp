import Car from './ExerciseOne';

function App() {
  // Part I: The carinfo object
  const carinfo = {name: "Ford", model: "Mustang"};

  return (
    <div className="App">
      <Car carInfo={carinfo} />
    </div>
  );
}

export default App;