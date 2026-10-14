import { configureStore } from "@reduxjs/toolkit";
import plannerReducer, { createInitialState } from "../features/planner/plannerSlice";
import { restoreState } from "../features/planner/persist";

const STORAGE_KEY = "rtk-daily-planner:v1";

function loadPlanner() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return (raw && restoreState(JSON.parse(raw))) || createInitialState();
  } catch {
    return createInitialState();
  }
}

// configureStore combines the slice reducers and turns on Redux DevTools automatically.
export const store = configureStore({
  reducer: {
    planner: plannerReducer,
  },
  preloadedState: { planner: loadPlanner() },
});

let lastSaved = store.getState().planner.tasksByDay;
store.subscribe(() => {
  const { tasksByDay } = store.getState().planner;
  if (tasksByDay === lastSaved) return; // selecting a date doesn't need a write
  lastSaved = tasksByDay;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ tasksByDay }));
  } catch {
    /* storage unavailable or full: ignore */
  }
});
