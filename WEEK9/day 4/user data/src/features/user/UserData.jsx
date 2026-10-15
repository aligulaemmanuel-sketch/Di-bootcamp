import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUser } from './userSlice';

export default function UserData() {
  const dispatch = useDispatch();
  const { data, loading, error } = useSelector((state) => state.user);

  useEffect(() => {
    dispatch(fetchUser(1));
  }, [dispatch]);

  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: 480, margin: '2rem auto' }}>
      <h1>User Data</h1>
      <button onClick={() => dispatch(fetchUser(1))} disabled={loading}>
        Refetch user
      </button>

      {loading && <p>Loading...</p>}
      {error && <p role="alert" style={{ color: 'crimson' }}>Error: {error}</p>}

      {!loading && !error && data.id && (
        <ul>
          <li><strong>Name:</strong> {data.name}</li>
          <li><strong>Username:</strong> {data.username}</li>
          <li><strong>Email:</strong> {data.email}</li>
          <li><strong>Phone:</strong> {data.phone}</li>
          <li><strong>Website:</strong> {data.website}</li>
        </ul>
      )}
    </div>
  );
}
