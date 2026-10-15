import React from "react";
import { useSelector } from "react-redux";
import TodoItem from "./TodoItem";
import { selectTodos } from "./todosSlice";

export default function TodoList() {
  const todos = useSelector(selectTodos);

  if (todos.length === 0) {
    return <p className="empty">Nothing here. Add a todo above!</p>;
  }

  const remaining = todos.filter((t) => !t.completed).length;

  return (
    <>
      <ul className="todo-list">
        {todos.map((todo) => (
          <TodoItem key={todo.id} todo={todo} />
        ))}
      </ul>
      <p className="summary">
        {remaining} {remaining === 1 ? "item" : "items"} left
      </p>
    </>
  );
}
