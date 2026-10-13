import {
  SELECT_DATE,
  ADD_TASK,
  EDIT_TASK,
  DELETE_TASK,
  TOGGLE_TASK,
  DISMISS_ERROR,
} from "./actionTypes.js";

let counter = 0;
export const makeId = () => `${Date.now().toString(36)}-${(counter++).toString(36)}`;

// date is always a "YYYY-MM-DD" key.
export const selectDate = (date) => ({
  type: SELECT_DATE,
  payload: { date },
});

export const addTask = (date, { title, time = "" }) => ({
  type: ADD_TASK,
  payload: { date, id: makeId(), title, time },
});

// changes may contain title and/or time.
export const editTask = (date, id, changes) => ({
  type: EDIT_TASK,
  payload: { date, id, changes },
});

export const deleteTask = (date, id) => ({
  type: DELETE_TASK,
  payload: { date, id },
});

export const toggleTask = (date, id) => ({
  type: TOGGLE_TASK,
  payload: { date, id },
});

export const dismissError = () => ({ type: DISMISS_ERROR });
