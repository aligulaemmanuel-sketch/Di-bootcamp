import React from "react";
import AddTodo from "./components/AddTodo";
import TodoList from "./components/TodoList";
import Footer from "./components/Footer";

export default function App() {
  return (
    <main className="app">
      <h1>Todo List</h1>
      <AddTodo />
      <TodoList />
      <Footer />
    </main>
  );
}
