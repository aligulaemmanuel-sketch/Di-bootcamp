import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login, logoutUser } from '../features/auth/authThunks';

export default function AuthForm() {
  const dispatch = useDispatch();
  const { user, isAuthenticated, loading, error } = useSelector(
    (state) => state.auth
  );
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  if (isAuthenticated) {
    return (
      <div>
        <span>
          Signed in as <strong>{user.username}</strong>
        </span>{' '}
        <button onClick={() => dispatch(logoutUser())}>Log out</button>
      </div>
    );
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(login({ username, password }));
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <input
        aria-label="Username"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        aria-label="Password"
        type="password"
        placeholder="Password (4+ chars)"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Log in'}
      </button>
      {error && (
        <p role="alert" style={{ color: 'crimson', width: '100%', margin: 0 }}>
          {error}
        </p>
      )}
    </form>
  );
}
