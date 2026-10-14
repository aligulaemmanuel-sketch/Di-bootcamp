import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { editTask } from "./plannerSlice";
import { validateTask, MAX_TITLE_LENGTH } from "../../utils/validation";

// Inline form for editing one task. Calls onDone() after saving or cancelling.
export default function EditTask({ date, task, onDone }) {
  const dispatch = useDispatch();
  const [title, setTitle] = useState(task.title);
  const [time, setTime] = useState(task.time);
  const [error, setError] = useState("");

  const save = (e) => {
    e.preventDefault();
    const result = validateTask({ title, time });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    dispatch(editTask(date, task.id, result.value));
    onDone();
  };

  return (
    <form onSubmit={save} noValidate onKeyDown={(e) => e.key === "Escape" && onDone()}>
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
        <button type="button" onClick={onDone}>
          Cancel
        </button>
      </div>
    </form>
  );
}
