import { createStore } from "redux";
import todoReducer from "./reducer.js";
import { migrateState } from "./persist.js";

const STORAGE_KEY = "redux-todo-app:v2";
const LEGACY_KEY = "redux-todo-app:v1";

function loadState() {
  try {
    const raw =
      localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_KEY);
    if (!raw) return undefined;
    return migrateState(JSON.parse(raw));
  } catch {
    return undefined;
  }
}

// Redux DevTools extension is used automatically if it's installed in the browser.
const store = createStore(
  todoReducer,
  loadState(),
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);

store.subscribe(() => {
  try {
    const { categories, filter } = store.getState();
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ categories, filter }));
  } catch {
    /* storage unavailable: ignore */
  }
});

export default store;
