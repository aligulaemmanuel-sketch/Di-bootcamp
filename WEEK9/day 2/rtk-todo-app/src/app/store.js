import { configureStore } from "@reduxjs/toolkit";
import todosReducer from "../features/todos/todosSlice";

const STORAGE_KEY = "rtk-todo-app:v1";

// Load saved todos, ignoring anything that isn't a valid list.
function loadTodos() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!Array.isArray(saved)) return undefined;
    return saved.filter(
      (t) => t && typeof t.id === "string" && typeof t.text === "string" && t.text.trim()
    ).map((t) => ({ id: t.id, text: t.text, completed: Boolean(t.completed) }));
  } catch {
    return undefined;
  }
}

// configureStore combines the slice reducers and turns on Redux DevTools automatically.
export const store = configureStore({
  reducer: {
    todos: todosReducer,
  },
  preloadedState: { todos: loadTodos() ?? [] },
});

let lastSaved = store.getState().todos;
store.subscribe(() => {
  const { todos } = store.getState();
  if (todos === lastSaved) return;
  lastSaved = todos;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  } catch {
    /* storage unavailable: ignore */
  }
});
