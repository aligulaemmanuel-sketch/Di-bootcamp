import { createSlice } from '@reduxjs/toolkit';

const API_URL = 'https://jsonplaceholder.typicode.com/users';

const initialState = {
  data: {},        // user information (empty object until loaded)
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    fetchUserRequest(state) {
      state.loading = true;
      state.error = null;
    },
    fetchUserSuccess(state, action) {
      state.loading = false;
      state.data = action.payload;
    },
    fetchUserFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const { fetchUserRequest, fetchUserSuccess, fetchUserFailure } =
  userSlice.actions;

// Thunk action creator: returns a function that receives dispatch.
export const fetchUser = (userId = 1) => async (dispatch) => {
  dispatch(fetchUserRequest());
  try {
    const response = await fetch(`${API_URL}/${userId}`);
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }
    const user = await response.json();
    dispatch(fetchUserSuccess(user));
  } catch (error) {
    dispatch(fetchUserFailure(error.message));
  }
};

export default userSlice.reducer;
