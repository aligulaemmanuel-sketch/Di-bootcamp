// Stable empty array so components don't re-render for days with no tasks.
export const NO_TASKS = Object.freeze([]);

export const selectSelectedDate = (state) => state.planner.selectedDate;
export const selectTasksByDay = (state) => state.planner.tasksByDay;
export const selectError = (state) => state.planner.error;

export const selectTasksForDate = (state, date) => state.planner.tasksByDay[date] || NO_TASKS;

// Timed tasks first (earliest to latest), then untimed tasks in the order they were added.
export function sortTasks(tasks) {
  return tasks
    .map((task, index) => ({ task, index }))
    .sort((a, b) => {
      const at = a.task.time;
      const bt = b.task.time;
      if (at && bt) return at.localeCompare(bt) || a.index - b.index;
      if (at) return -1;
      if (bt) return 1;
      return a.index - b.index;
    })
    .map(({ task }) => task);
}
