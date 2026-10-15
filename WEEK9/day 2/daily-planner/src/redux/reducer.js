import {
  SELECT_DATE,
  ADD_TASK,
  EDIT_TASK,
  DELETE_TASK,
  TOGGLE_TASK,
  DISMISS_ERROR,
} from "./actionTypes.js";
import { todayKey, isValidDateKey } from "../utils/dates.js";
import { validateTask } from "../utils/validation.js";

/*
 * State shape:
 * {
 *   tasksByDay: {
 *     "2026-10-12": [{ id, title, time: "09:30" | "", done }]
 *   },
 *   selectedDate: "YYYY-MM-DD",
 *   error: string | null   // set when an action is invalid; cleared by the next valid action
 * }
 * Days with no tasks have no key, so the object stays small.
 */
export const createInitialState = (selectedDate = todayKey()) => ({
  tasksByDay: {},
  selectedDate,
  error: null,
});

export const initialState = createInitialState();

const fail = (state, message) => ({ ...state, error: message });
const ok = (state, changes) => ({ ...state, ...changes, error: null });

const BAD_DATE = "That isn't a valid date.";
const NO_TASK = "That task doesn't exist.";

// Sets the task list for one day, dropping the key when the list is empty.
function withDay(tasksByDay, date, tasks) {
  if (tasks.length > 0) return { ...tasksByDay, [date]: tasks };
  const { [date]: _removed, ...rest } = tasksByDay;
  return rest;
}

export default function plannerReducer(state = initialState, action) {
  switch (action.type) {
    case SELECT_DATE: {
      const { date } = action.payload;
      if (!isValidDateKey(date)) return fail(state, BAD_DATE);
      return ok(state, { selectedDate: date });
    }

    case ADD_TASK: {
      const { date, id } = action.payload;
      if (!isValidDateKey(date)) return fail(state, BAD_DATE);
      const result = validateTask(action.payload);
      if (!result.ok) return fail(state, result.error);
      const existing = state.tasksByDay[date] || [];
      return ok(state, {
        tasksByDay: withDay(state.tasksByDay, date, [
          ...existing,
          { id, ...result.value, done: false },
        ]),
      });
    }

    case EDIT_TASK: {
      const { date, id, changes = {} } = action.payload;
      if (!isValidDateKey(date)) return fail(state, BAD_DATE);
      const existing = state.tasksByDay[date] || [];
      const task = existing.find((t) => t.id === id);
      if (!task) return fail(state, NO_TASK);
      const result = validateTask({
        title: changes.title ?? task.title,
        time: changes.time ?? task.time,
      });
      if (!result.ok) return fail(state, result.error);
      return ok(state, {
        tasksByDay: withDay(
          state.tasksByDay,
          date,
          existing.map((t) => (t.id === id ? { ...t, ...result.value } : t))
        ),
      });
    }

    case DELETE_TASK: {
      const { date, id } = action.payload;
      if (!isValidDateKey(date)) return fail(state, BAD_DATE);
      const existing = state.tasksByDay[date] || [];
      if (!existing.some((t) => t.id === id)) return fail(state, NO_TASK);
      return ok(state, {
        tasksByDay: withDay(
          state.tasksByDay,
          date,
          existing.filter((t) => t.id !== id)
        ),
      });
    }

    case TOGGLE_TASK: {
      const { date, id } = action.payload;
      if (!isValidDateKey(date)) return fail(state, BAD_DATE);
      const existing = state.tasksByDay[date] || [];
      if (!existing.some((t) => t.id === id)) return fail(state, NO_TASK);
      return ok(state, {
        tasksByDay: withDay(
          state.tasksByDay,
          date,
          existing.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
        ),
      });
    }

    case DISMISS_ERROR:
      return state.error ? { ...state, error: null } : state;

    default:
      return state;
  }
}
