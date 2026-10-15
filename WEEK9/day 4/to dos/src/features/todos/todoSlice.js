import { createSlice, nanoid } from '@reduxjs/toolkit';

const API_URL = 'https://jsonplaceholder.typicode.com/todos';

const initialState = {
  items: [],
  loading: false,
  error: null,
};

const todoSlice = createSlice({
  name: 'todos',
  initialState,
  reducers: {
    addTodo: {
      reducer(state, action) {
        state.items.push(action.payload);
      },
      // prepare lets us generate the id outside the reducer (keeps it pure)
      prepare(title) {
        return { payload: { id: nanoid(), title, completed: false } };
      },
    },
    removeTodo(state, action) {
      state.items = state.items.filter((todo) => todo.id !== action.payload);
    },
    toggleTodo(state, action) {
      const todo = state.items.find((t) => t.id === action.payload);
      if (todo) todo.completed = !todo.completed;
    },
    setTodos(state, action) {
      state.items = action.payload;
    },
    fetchTodosRequest(state) {
      state.loading = true;
      state.error = null;
    },
    fetchTodosFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Any time todos are stored, loading is over.
    builder.addCase(todoSlice.actions.setTodos, (state) => {
      state.loading = false;
    });
  },
});

export const {
  addTodo,
  removeTodo,
  toggleTodo,
  setTodos,
  fetchTodosRequest,
  fetchTodosFailure,
} = todoSlice.actions;

// Thunk: fetch todos from the mock API, then store them with setTodos.
export const fetchTodos = (limit = 5) => async (dispatch) => {
  dispatch(fetchTodosRequest());
  try {
    const response = await fetch(`${API_URL}?_limit=${limit}`);
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }
    const todos = await response.json();
    dispatch(setTodos(todos));
  } catch (error) {
    dispatch(fetchTodosFailure(error.message));
  }
};

export default todoSlice.reducer;
