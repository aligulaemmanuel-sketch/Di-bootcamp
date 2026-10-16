import { createSelector } from '@reduxjs/toolkit';

// ---- Input selectors (plain state readers) ----
export const selectTasks = (state) => state.tasks;
export const selectCategories = (state) => state.categories.items;
export const selectSelectedCategoryId = (state) => state.categories.selectedId;

// Extra-argument input selector
const selectIdArg = (_state, id) => id;

// Tasks belonging to a specific category ('all' returns every task).
// Usage: useSelector((state) => selectTasksByCategory(state, categoryId))
// Recomputes only when `tasks` or the category id changes.
export const selectTasksByCategory = createSelector(
  [selectTasks, selectIdArg],
  (tasks, categoryId) =>
    categoryId === 'all' ? tasks : tasks.filter((t) => t.categoryId === categoryId)
);

// Count of completed tasks (progress === 100)
export const selectCompletedTasks = createSelector([selectTasks], (tasks) =>
  tasks.reduce((count, t) => (t.progress === 100 ? count + 1 : count), 0)
);

// Category details by id (undefined if not found, e.g. for 'all')
export const selectCategoryById = createSelector(
  [selectCategories, selectIdArg],
  (categories, id) => categories.find((c) => c.id === id)
);
