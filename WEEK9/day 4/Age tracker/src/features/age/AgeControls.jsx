import { useDispatch, useSelector } from 'react-redux';
import { ageUpAsync, ageDownAsync } from './ageSlice';

export default function AgeControls() {
  const dispatch = useDispatch();
  const loading = useSelector((state) => state.age.loading);

  // The buttons are type="button" so the form never submits/reloads the page.
  return (
    <form onSubmit={(e) => e.preventDefault()} className="age-controls">
      <button type="button" disabled={loading} onClick={() => dispatch(ageUpAsync())}>
        Age Up
      </button>
      <button type="button" disabled={loading} onClick={() => dispatch(ageDownAsync())}>
        Age Down
      </button>
    </form>
  );
}
