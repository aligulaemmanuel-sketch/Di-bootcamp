import React from "react";
import { useDispatch } from "react-redux";
import { deleteTask } from "./plannerSlice";

// Delete button for one task; asks for confirmation before dispatching deleteTask.
export default function DeleteTask({ date, task }) {
  const dispatch = useDispatch();

  const handleClick = () => {
    if (window.confirm(`Delete "${task.title}"?`)) {
      dispatch(deleteTask(date, task.id));
    }
  };

  return (
    <button className="danger" onClick={handleClick} aria-label={`Delete ${task.title}`}>
      Delete
    </button>
  );
}
