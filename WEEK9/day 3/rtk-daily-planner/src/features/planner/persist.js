import { isValidDateKey, todayKey } from "../../utils/dates.js";
import { validateTask } from "../../utils/validation.js";

/*
 * Turns whatever was saved in localStorage into a valid planner state, dropping anything
 * malformed so a corrupted save can never crash the app. Only tasks are persisted; the
 * app always opens on today's date. Returns undefined when there's nothing usable.
 */
export function restoreState(saved) {
  if (!saved || typeof saved !== "object") return undefined;
  const raw = saved.tasksByDay;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return undefined;

  const tasksByDay = {};
  for (const [date, tasks] of Object.entries(raw)) {
    if (!isValidDateKey(date) || !Array.isArray(tasks)) continue;
    const clean = [];
    for (const t of tasks) {
      if (!t || typeof t.id !== "string") continue;
      const result = validateTask(t);
      if (!result.ok) continue;
      clean.push({ id: t.id, ...result.value, done: Boolean(t.done) });
    }
    if (clean.length > 0) tasksByDay[date] = clean;
  }

  return { tasksByDay, selectedDate: todayKey(), error: null };
}
