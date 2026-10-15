import React from "react";
import TodoItem from "./TodoItem";

// Presentational list: give it todos and two callbacks.
export default function TodoList({ todos, emptyMessage, onToggle, onRemove }) {
  if (todos.length === 0) {
    return <p className="empty">{emptyMessage}</p>;
  }

  return (
    <ul className="todo-list">
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onRemove={onRemove}
        />
      ))}
    </ul>
  );
}
