import { createSlice } from "@reduxjs/toolkit";
import { todoReducers } from "./todoReducers";

// State is simply an array of todos: [{ id, text, completed }]
const initialState = [];

const todosSlice = createSlice({
  name: "todos",
  initialState,
  reducers: todoReducers,
});

export const { addTodo, toggleTodo, removeTodo } = todosSlice.actions;

export const selectTodos = (state) => state.todos;

export default todosSlice.reducer;
