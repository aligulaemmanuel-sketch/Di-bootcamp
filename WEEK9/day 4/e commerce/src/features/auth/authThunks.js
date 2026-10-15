import { loginRequest, loginSuccess, loginFailure, logout } from './authSlice';

// Simulated login: no real server. After a short delay it succeeds for any
// non-empty username with a password of at least 4 characters.
export const login =
  (credentials, delayMs = 600) =>
  async (dispatch) => {
    dispatch(loginRequest());
    await new Promise((resolve) => setTimeout(resolve, delayMs));

    const username = credentials?.username?.trim();
    const password = credentials?.password ?? '';

    if (!username || password.length < 4) {
      dispatch(
        loginFailure('Enter a username and a password of at least 4 characters.')
      );
      return;
    }
    dispatch(loginSuccess({ username }));
  };

export const logoutUser = () => (dispatch) => {
  dispatch(logout());
};
