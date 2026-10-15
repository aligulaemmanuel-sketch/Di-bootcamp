import { useSelector } from 'react-redux';

export default function AgeDisplay() {
  const { age, loading } = useSelector((state) => state.age);

  return (
    <div className="age-display" aria-live="polite">
      <p className="age-label">Current age</p>
      <p className="age-value">{age}</p>
      <div className="spinner-slot">
        {loading && (
          <span className="spinner" role="status" aria-label="Updating age" />
        )}
      </div>
    </div>
  );
}
