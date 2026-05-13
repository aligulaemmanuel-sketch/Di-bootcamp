import React from 'react';
import BuggyCounter from './BuggyCounter';
import ErrorBoundary from './ErrorBoundary';

function App() {
  return (
    <div>
      <p><b>Simulation 1: Two counters in one ErrorBoundary.</b></p>
      <ErrorBoundary>
        <BuggyCounter />
        <BuggyCounter />
      </ErrorBoundary>

      <hr />
      <p><b>Simulation 2: Two counters each in their own ErrorBoundary.</b></p>
      <ErrorBoundary><BuggyCounter /></ErrorBoundary>
      <ErrorBoundary><BuggyCounter /></ErrorBoundary>

      <hr />
      <p><b>Simulation 3: Counter without ErrorBoundary.</b></p>
      <BuggyCounter />
    </div>
  );
}

export default App;