import React, { useState } from "react";
import { connect } from "react-redux";
import { addTask } from "../redux/actions";
import { validateTask, MAX_TITLE_LENGTH } from "../utils/validation";

// Reusable: pass the date ("YYYY-MM-DD") the new task belongs to.
function AddTask({ date, addTask }) {
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const result = validateTask({ title, time });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    addTask(date, result.value);
    setTitle("");
    setTime("");
    setError("");
  };

  return (
    <form className="add-task" onSubmit={handleSubmit} noValidate>
      <div className="add-task-row">
        <input
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (error) setError("");
          }}
          placeholder="Add a task for this day"
          aria-label="Task title"
          maxLength={MAX_TITLE_LENGTH + 20}
        />
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          aria-label="Task time (optional)"
        />
        <button type="submit" className="primary">
          Add
        </button>
      </div>
      {error && (
        <p className="field-error" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}

const mapDispatchToProps = { addTask };

export default connect(null, mapDispatchToProps)(AddTask);
