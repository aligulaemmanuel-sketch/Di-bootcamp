import React from "react";

export default function TodoItem({ todo, onToggle, onRemove }) {
  return (
    <li className={`todo-item${todo.completed ? " completed" : ""}`}>
      <label>
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={() => onToggle(todo.id)}
        />
        <span>{todo.text}</span>
      </label>
      <button
        className="remove"
        onClick={() => onRemove(todo.id)}
        aria-label={`Remove ${todo.text}`}
      >
        ×
      </button>
    </li>
  );
}
