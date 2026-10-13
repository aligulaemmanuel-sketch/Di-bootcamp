export const MAX_TITLE_LENGTH = 100;

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

// Shared by the forms (instant feedback) and the reducer (safety net).
// Returns { ok: true, value: { title, time } } or { ok: false, error }.
export function validateTask({ title, time } = {}) {
  const cleanTitle = typeof title === "string" ? title.trim() : "";
  if (!cleanTitle) return { ok: false, error: "Task title can't be empty." };
  if (cleanTitle.length > MAX_TITLE_LENGTH) {
    return {
      ok: false,
      error: `Task title must be ${MAX_TITLE_LENGTH} characters or fewer.`,
    };
  }
  const cleanTime = typeof time === "string" ? time.trim() : "";
  if (cleanTime && !TIME_PATTERN.test(cleanTime)) {
    return { ok: false, error: "Time must look like 09:30 (24-hour)." };
  }
  return { ok: true, value: { title: cleanTitle, time: cleanTime } };
}
