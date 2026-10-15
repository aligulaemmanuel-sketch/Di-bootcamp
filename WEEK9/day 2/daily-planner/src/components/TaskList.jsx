import React, { useMemo } from "react";
import { connect } from "react-redux";
import AddTask from "./AddTask";
import TaskItem from "./TaskItem";
import { editTask, deleteTask, toggleTask } from "../redux/actions";
import { getTasksForDate, sortTasks } from "../redux/selectors";
import { formatLongDate } from "../utils/dates";

function TaskList({ date, tasks, editTask, deleteTask, toggleTask }) {
  const sorted = useMemo(() => sortTasks(tasks), [tasks]);
  const doneCount = tasks.filter((t) => t.done).length;

  const handleDelete = (id) => {
    const task = tasks.find((t) => t.id === id);
    if (task && window.confirm(`Delete "${task.title}"?`)) deleteTask(date, id);
  };

  return (
    <section className="task-panel">
      <header className="task-header">
        <h2>{formatLongDate(date)}</h2>
        <span className="summary">
          {tasks.length === 0
            ? "No tasks"
            : `${doneCount} of ${tasks.length} done`}
        </span>
      </header>

      <AddTask date={date} />

      {sorted.length === 0 ? (
        <p className="empty">Nothing planned for this day yet.</p>
      ) : (
        <ul className="tasks">
          {sorted.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={(id) => toggleTask(date, id)}
              onSave={(id, changes) => editTask(date, id, changes)}
              onDelete={handleDelete}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

const mapStateToProps = (state) => ({
  date: state.selectedDate,
  tasks: getTasksForDate(state, state.selectedDate),
});

const mapDispatchToProps = { editTask, deleteTask, toggleTask };

export default connect(mapStateToProps, mapDispatchToProps)(TaskList);
