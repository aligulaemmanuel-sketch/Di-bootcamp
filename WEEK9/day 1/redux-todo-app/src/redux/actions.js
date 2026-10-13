import {
  ADD_TODO,
  TOGGLE_TODO,
  REMOVE_TODO,
  CLEAR_COMPLETED,
  SET_FILTER,
} from "./actionTypes";

let nextId = Date.now();

export const addTodo = (text) => ({
  type: ADD_TODO,
  payload: { id: nextId++, text },
});

export const toggleTodo = (id) => ({
  type: TOGGLE_TODO,
  payload: { id },
});

export const removeTodo = (id) => ({
  type: REMOVE_TODO,
  payload: { id },
});

export const clearCompleted = () => ({
  type: CLEAR_COMPLETED,
});

export const setFilter = (filter) => ({
  type: SET_FILTER,
  payload: { filter },
});
