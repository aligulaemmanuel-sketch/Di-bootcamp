import { createStore } from "redux";
import todoReducer, { initialState } from "./reducer";

const STORAGE_KEY = "redux-todo-app:v1";

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return undefined;
    const saved = JSON.parse(raw);
    return { ...initialState, ...saved };
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store.getState()));
  } catch {
    /* storage unavailable: ignore */
  }
});

export default store;
