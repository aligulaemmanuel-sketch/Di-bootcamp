import AgeDisplay from './features/age/AgeDisplay';
import AgeControls from './features/age/AgeControls';

export default function App() {
  return (
    <main className="app">
      <h1>Age Tracker</h1>
      <AgeDisplay />
      <AgeControls />
    </main>
  );
}
