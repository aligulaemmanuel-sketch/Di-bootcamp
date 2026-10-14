import React from "react";
import { useDispatch } from "react-redux";
import { toggleTodo, removeTodo } from "./todosSlice";

export default function TodoItem({ todo }) {
  const dispatch = useDispatch();

  return (
    <li className={`todo-item${todo.completed ? " completed" : ""}`}>
      <label>
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={() => dispatch(toggleTodo(todo.id))}
        />
        <span>{todo.text}</span>
      </label>
      <button
        className="remove"
        onClick={() => dispatch(removeTodo(todo.id))}
        aria-label={`Remove ${todo.text}`}
      >
        ×
      </button>
    </li>
  );
}
