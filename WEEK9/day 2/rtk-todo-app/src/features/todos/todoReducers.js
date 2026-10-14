// The case reducers, kept as plain functions so they can be unit-tested without Redux Toolkit.
// They are written in the "mutating" style because createSlice wraps them in Immer, which
// turns these mutations into safe immutable updates.

let counter = 0;
export const makeId = () => `${Date.now().toString(36)}-${(counter++).toString(36)}`;

export const todoReducers = {
  addTodo: {
    // `prepare` builds the payload (including the id) so the reducer itself stays pure.
    prepare(text) {
      return { payload: { id: makeId(), text } };
    },
    reducer(state, action) {
      const text = typeof action.payload.text === "string" ? action.payload.text.trim() : "";
      if (!text) return; // ignore empty todos
      state.push({ id: action.payload.id, text, completed: false });
    },
  },

  toggleTodo(state, action) {
    const todo = state.find((t) => t.id === action.payload);
    if (todo) todo.completed = !todo.completed;
  },

  removeTodo(state, action) {
    // Returning a new array replaces the state.
    return state.filter((t) => t.id !== action.payload);
  },
};
