import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { toggleTask } from "./plannerSlice";
import EditTask from "./EditTask";
import DeleteTask from "./DeleteTask";

export default function TaskItem({ date, task }) {
  const dispatch = useDispatch();
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <li className="task editing">
        <EditTask date={date} task={task} onDone={() => setEditing(false)} />
      </li>
    );
  }

  return (
    <li className={`task${task.done ? " done" : ""}`}>
      <label>
        <input
          type="checkbox"
          checked={task.done}
          onChange={() => dispatch(toggleTask(date, task.id))}
          aria-label={`Mark "${task.title}" as done`}
        />
        {task.time && <span className="time">{task.time}</span>}
        <span className="title">{task.title}</span>
      </label>
      <div className="task-actions">
        <button onClick={() => setEditing(true)} aria-label={`Edit ${task.title}`}>
          Edit
        </button>
        <DeleteTask date={date} task={task} />
      </div>
    </li>
  );
}
