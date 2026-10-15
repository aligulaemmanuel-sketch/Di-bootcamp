import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import AddTask from "./AddTask";
import TaskItem from "./TaskItem";
import { selectSelectedDate, selectTasksForDate, sortTasks } from "./selectors";
import { formatLongDate } from "../../utils/dates";

export default function TaskList() {
  const date = useSelector(selectSelectedDate);
  // Tasks for the selected day only: switching days in the calendar changes this list.
  const tasks = useSelector((state) => selectTasksForDate(state, date));
  const sorted = useMemo(() => sortTasks(tasks), [tasks]);
  const doneCount = tasks.filter((t) => t.done).length;

  return (
    <section className="task-panel">
      <header className="task-header">
        <h2>{formatLongDate(date)}</h2>
        <span className="summary">
          {tasks.length === 0 ? "No tasks" : `${doneCount} of ${tasks.length} done`}
        </span>
      </header>

      <AddTask date={date} />

      {sorted.length === 0 ? (
        <p className="empty">Nothing planned for this day yet.</p>
      ) : (
        <ul className="tasks">
          {sorted.map((task) => (
            <TaskItem key={task.id} date={date} task={task} />
          ))}
        </ul>
      )}
    </section>
  );
}
