import React from "react";
import AddTodo from "./features/todos/AddTodo";
import TodoList from "./features/todos/TodoList";

export default function App() {
  return (
    <main className="app">
      <h1>Todo List</h1>
      <AddTodo />
      <TodoList />
    </main>
  );
}
