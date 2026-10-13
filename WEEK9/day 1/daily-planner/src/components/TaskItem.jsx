import React, { useState } from "react";
import { validateTask, MAX_TITLE_LENGTH } from "../utils/validation";

// Presentational: shows one task and an inline edit form. Knows nothing about Redux.
export default function TaskItem({ task, onToggle, onSave, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [time, setTime] = useState(task.time);
  const [error, setError] = useState("");

  const startEditing = () => {
    setTitle(task.title);
    setTime(task.time);
    setError("");
    setEditing(true);
  };

  const cancel = () => {
    setEditing(false);
    setError("");
  };

  const save = (e) => {
    e.preventDefault();
    const result = validateTask({ title, time });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onSave(task.id, result.value);
    setEditing(false);
  };

  if (editing) {
    return (
      <li className="task editing">
        <form onSubmit={save} noValidate onKeyDown={(e) => e.key === "Escape" && cancel()}>
          <div className="add-task-row">
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError("");
              }}
              aria-label="Edit task title"
              maxLength={MAX_TITLE_LENGTH + 20}
              autoFocus
            />
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              aria-label="Edit task time"
            />
          </div>
          {error && (
            <p className="field-error" role="alert">
              {error}
            </p>
          )}
          <div className="edit-actions">
            <button type="submit" className="primary">
              Save
            </button>
            <button type="button" onClick={cancel}>
              Cancel
            </button>
          </div>
        </form>
      </li>
    );
  }

  return (
    <li className={`task${task.done ? " done" : ""}`}>
      <label>
        <input
          type="checkbox"
          checked={task.done}
          onChange={() => onToggle(task.id)}
          aria-label={`Mark "${task.title}" as done`}
        />
        {task.time && <span className="time">{task.time}</span>}
        <span className="title">{task.title}</span>
      </label>
      <div className="task-actions">
        <button onClick={startEditing} aria-label={`Edit ${task.title}`}>
          Edit
        </button>
        <button
          className="danger"
          onClick={() => onDelete(task.id)}
          aria-label={`Delete ${task.title}`}
        >
          Delete
        </button>
      </div>
    </li>
  );
}
