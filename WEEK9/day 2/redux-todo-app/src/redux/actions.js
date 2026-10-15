import {
  ADD_CATEGORY,
  REMOVE_CATEGORY,
  ADD_TODO,
  TOGGLE_TODO,
  REMOVE_TODO,
  CLEAR_COMPLETED,
  SET_FILTER,
  DISMISS_ERROR,
} from "./actionTypes.js";

let counter = 0;
// Unique enough for a local app: timestamp + per-session counter.
export const makeId = () => `${Date.now().toString(36)}-${(counter++).toString(36)}`;

export const addCategory = (name) => ({
  type: ADD_CATEGORY,
  payload: { id: makeId(), name },
});

export const removeCategory = (categoryId) => ({
  type: REMOVE_CATEGORY,
  payload: { categoryId },
});

export const addTodo = (categoryId, text) => ({
  type: ADD_TODO,
  payload: { categoryId, id: makeId(), text },
});

export const toggleTodo = (categoryId, todoId) => ({
  type: TOGGLE_TODO,
  payload: { categoryId, todoId },
});

export const removeTodo = (categoryId, todoId) => ({
  type: REMOVE_TODO,
  payload: { categoryId, todoId },
});

export const clearCompleted = () => ({ type: CLEAR_COMPLETED });

export const setFilter = (filter) => ({
  type: SET_FILTER,
  payload: { filter },
});

export const dismissError = () => ({ type: DISMISS_ERROR });
