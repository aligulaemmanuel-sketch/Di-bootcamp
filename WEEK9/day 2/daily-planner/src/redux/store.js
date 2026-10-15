import { createStore } from "redux";
import plannerReducer from "./reducer.js";
import { restoreState } from "./persist.js";

const STORAGE_KEY = "daily-planner:v1";

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? restoreState(JSON.parse(raw)) : undefined;
  } catch {
    return undefined;
  }
}

// Redux DevTools extension is used automatically if it's installed in the browser.
const store = createStore(
  plannerReducer,
  loadState(),
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);

let lastSaved = store.getState().tasksByDay;
store.subscribe(() => {
  const { tasksByDay } = store.getState();
  if (tasksByDay === lastSaved) return; // selecting a date doesn't need a write
  lastSaved = tasksByDay;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ tasksByDay }));
  } catch {
    /* storage unavailable or full: ignore */
  }
});

export default store;
