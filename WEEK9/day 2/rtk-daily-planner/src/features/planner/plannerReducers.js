// The case reducers, kept as plain functions so they can be unit-tested without Redux Toolkit.
// They are written in the "mutating" style because createSlice wraps them in Immer, which
// turns these mutations into safe immutable updates.
//
// Invalid actions never touch the tasks: they only set `state.error`. Any valid action clears it.

import { isValidDateKey } from "../../utils/dates.js";
import { validateTask } from "../../utils/validation.js";

let counter = 0;
export const makeId = () => `${Date.now().toString(36)}-${(counter++).toString(36)}`;

export const BAD_DATE = "That isn't a valid date.";
export const NO_TASK = "That task doesn't exist.";

const fail = (state, message) => {
  state.error = message;
};

export const plannerReducers = {
  // payload: a "YYYY-MM-DD" date key
  selectDate(state, action) {
    if (!isValidDateKey(action.payload)) return fail(state, BAD_DATE);
    state.selectedDate = action.payload;
    state.error = null;
  },

  addTask: {
    // payload: { date, id, title, time }
    prepare(date, { title, time = "" } = {}) {
      return { payload: { date, id: makeId(), title, time } };
    },
    reducer(state, action) {
      const { date, id } = action.payload;
      if (!isValidDateKey(date)) return fail(state, BAD_DATE);
      const result = validateTask(action.payload);
      if (!result.ok) return fail(state, result.error);
      if (!state.tasksByDay[date]) state.tasksByDay[date] = [];
      state.tasksByDay[date].push({ id, ...result.value, done: false });
      state.error = null;
    },
  },

  editTask: {
    // payload: { date, id, changes: { title?, time? } }
    prepare(date, id, changes) {
      return { payload: { date, id, changes } };
    },
    reducer(state, action) {
      const { date, id, changes = {} } = action.payload;
      if (!isValidDateKey(date)) return fail(state, BAD_DATE);
      const task = (state.tasksByDay[date] || []).find((t) => t.id === id);
      if (!task) return fail(state, NO_TASK);
      const result = validateTask({
        title: changes.title ?? task.title,
        time: changes.time ?? task.time,
      });
      if (!result.ok) return fail(state, result.error);
      task.title = result.value.title;
      task.time = result.value.time;
      state.error = null;
    },
  },

  deleteTask: {
    // payload: { date, id }
    prepare(date, id) {
      return { payload: { date, id } };
    },
    reducer(state, action) {
      const { date, id } = action.payload;
      if (!isValidDateKey(date)) return fail(state, BAD_DATE);
      const tasks = state.tasksByDay[date] || [];
      const index = tasks.findIndex((t) => t.id === id);
      if (index === -1) return fail(state, NO_TASK);
      tasks.splice(index, 1);
      // Keep the object small: a day with no tasks has no key.
      if (tasks.length === 0) delete state.tasksByDay[date];
      state.error = null;
    },
  },

  toggleTask: {
    prepare(date, id) {
      return { payload: { date, id } };
    },
    reducer(state, action) {
      const { date, id } = action.payload;
      if (!isValidDateKey(date)) return fail(state, BAD_DATE);
      const task = (state.tasksByDay[date] || []).find((t) => t.id === id);
      if (!task) return fail(state, NO_TASK);
      task.done = !task.done;
      state.error = null;
    },
  },

  dismissError(state) {
    state.error = null;
  },
};
