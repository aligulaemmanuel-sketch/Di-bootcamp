import test from "node:test";
import assert from "node:assert/strict";
import { plannerReducers as r } from "../src/features/planner/plannerReducers.js";
import { sortTasks, NO_TASKS, selectTasksForDate } from "../src/features/planner/selectors.js";

/*
 * createSlice runs each case reducer on an Immer draft. Immer isn't installed where these
 * tests were written, so `apply` stands in for it: it hands the reducer a deep copy
 * ("draft") and returns either the reducer's return value or the modified copy.
 * Run the app itself (npm run dev) to exercise the real createSlice/configureStore wiring.
 */
function apply(reducer, state, action) {
  const draft = structuredClone(state);
  const result = reducer(draft, action);
  return result === undefined ? draft : result;
}

const D1 = "2026-10-12";
const D2 = "2026-10-13";
const start = (selectedDate = D1) => ({ tasksByDay: {}, selectedDate, error: null });

// Action helpers that mirror the real action creators (prepare -> reducer).
const selectDate = (s, date) => apply(r.selectDate, s, { payload: date });
const addTask = (s, date, values) =>
  apply(r.addTask.reducer, s, { payload: r.addTask.prepare(date, values).payload });
const editTask = (s, date, id, changes) =>
  apply(r.editTask.reducer, s, { payload: r.editTask.prepare(date, id, changes).payload });
const deleteTask = (s, date, id) =>
  apply(r.deleteTask.reducer, s, { payload: r.deleteTask.prepare(date, id).payload });
const toggleTask = (s, date, id) =>
  apply(r.toggleTask.reducer, s, { payload: r.toggleTask.prepare(date, id).payload });
const dismiss = (s) => apply(r.dismissError, s, { payload: undefined });
const idAt = (s, date, i) => s.tasksByDay[date][i].id;

test("prepare callbacks build payloads (with a unique id for addTask)", () => {
  const a = r.addTask.prepare(D1, { title: "A", time: "09:00" }).payload;
  const b = r.addTask.prepare(D1, { title: "B" }).payload;
  assert.deepEqual([a.date, a.title, a.time], [D1, "A", "09:00"]);
  assert.equal(b.time, "");
  assert.notEqual(a.id, b.id);
  assert.deepEqual(r.editTask.prepare(D1, "x", { title: "t" }).payload, {
    date: D1,
    id: "x",
    changes: { title: "t" },
  });
  assert.deepEqual(r.deleteTask.prepare(D1, "x").payload, { date: D1, id: "x" });
  assert.deepEqual(r.toggleTask.prepare(D1, "x").payload, { date: D1, id: "x" });
  const ids = new Set(Array.from({ length: 500 }, () => r.addTask.prepare(D1, {}).payload.id));
  assert.equal(ids.size, 500);
});

test("selectDate changes the day; invalid dates are rejected", () => {
  const s = selectDate(start(), D2);
  assert.equal(s.selectedDate, D2);
  for (const bad of ["", "tomorrow", "2026-02-30", "2026-13-01", "12/10/2026", null, undefined]) {
    const next = selectDate(s, bad);
    assert.equal(next.selectedDate, D2, `kept date for ${bad}`);
    assert.match(next.error, /valid date/i);
  }
});

test("adds tasks to specific days and keeps days separate", () => {
  let s = start();
  s = addTask(s, D1, { title: "Gym", time: "07:00" });
  s = addTask(s, D1, { title: "Write report" });
  s = addTask(s, D2, { title: "Dentist", time: "15:30" });
  assert.deepEqual(s.tasksByDay[D1].map((t) => t.title), ["Gym", "Write report"]);
  assert.deepEqual(s.tasksByDay[D2].map((t) => t.title), ["Dentist"]);
  assert.equal(s.tasksByDay[D1][0].done, false);
  assert.equal(s.tasksByDay[D1][1].time, "");
  assert.equal(s.error, null);
});

test("trims titles", () => {
  const s = addTask(start(), D1, { title: "   padded   " });
  assert.equal(s.tasksByDay[D1][0].title, "padded");
});

test("add validation: empty, too long, bad time, bad date", () => {
  const s = start();
  const cases = [
    [D1, { title: "   " }, /empty/i],
    [D1, { title: "x".repeat(101) }, /100 characters/i],
    [D1, { title: "ok", time: "25:00" }, /time/i],
    [D1, { title: "ok", time: "9:30" }, /time/i],
    ["nope", { title: "ok" }, /valid date/i],
  ];
  for (const [date, values, pattern] of cases) {
    const next = addTask(s, date, values);
    assert.deepEqual(next.tasksByDay, {});
    assert.match(next.error, pattern);
  }
});

test("edits a task's title and time without touching others", () => {
  let s = addTask(addTask(start(), D1, { title: "A", time: "09:00" }), D1, { title: "B" });
  const id = idAt(s, D1, 0);
  s = editTask(s, D1, id, { title: "A edited", time: "10:15" });
  assert.deepEqual(
    [s.tasksByDay[D1][0].title, s.tasksByDay[D1][0].time, s.tasksByDay[D1][0].id],
    ["A edited", "10:15", id]
  );
  assert.equal(s.tasksByDay[D1][1].title, "B");
});

test("edit can change one field, and can clear the time", () => {
  let s = addTask(start(), D1, { title: "A", time: "09:00" });
  const id = idAt(s, D1, 0);
  s = editTask(s, D1, id, { title: "A2" });
  assert.deepEqual([s.tasksByDay[D1][0].title, s.tasksByDay[D1][0].time], ["A2", "09:00"]);
  s = editTask(s, D1, id, { time: "" });
  assert.equal(s.tasksByDay[D1][0].time, "");
});

test("edit validation and missing-task errors leave tasks unchanged", () => {
  const s = addTask(start(), D1, { title: "A" });
  const id = idAt(s, D1, 0);

  const empty = editTask(s, D1, id, { title: " " });
  assert.deepEqual(empty.tasksByDay, s.tasksByDay);
  assert.match(empty.error, /empty/i);

  assert.match(editTask(s, D1, id, { time: "99:99" }).error, /time/i);
  assert.match(editTask(s, D1, "nope", { title: "x" }).error, /doesn't exist/i);
  assert.match(editTask(s, D2, id, { title: "x" }).error, /doesn't exist/i);
  assert.match(editTask(s, "nope", id, { title: "x" }).error, /valid date/i);
});

test("deletes a task; removes the day key when its last task goes", () => {
  let s = addTask(addTask(start(), D1, { title: "A" }), D1, { title: "B" });
  s = deleteTask(s, D1, idAt(s, D1, 0));
  assert.deepEqual(s.tasksByDay[D1].map((t) => t.title), ["B"]);
  s = deleteTask(s, D1, idAt(s, D1, 0));
  assert.equal(D1 in s.tasksByDay, false);
  assert.deepEqual(s.tasksByDay, {});
});

test("deleting a missing task or from a bad date sets an error only", () => {
  const s = addTask(start(), D1, { title: "A" });
  const id = idAt(s, D1, 0);
  const missing = deleteTask(s, D1, "nope");
  assert.deepEqual(missing.tasksByDay, s.tasksByDay);
  assert.match(missing.error, /doesn't exist/i);
  assert.match(deleteTask(s, D2, id).error, /doesn't exist/i);
  assert.match(deleteTask(s, "bad", id).error, /valid date/i);
});

test("toggle flips done for one task only", () => {
  let s = addTask(addTask(start(), D1, { title: "A" }), D1, { title: "B" });
  const id = idAt(s, D1, 0);
  s = toggleTask(s, D1, id);
  assert.deepEqual(s.tasksByDay[D1].map((t) => t.done), [true, false]);
  s = toggleTask(s, D1, id);
  assert.deepEqual(s.tasksByDay[D1].map((t) => t.done), [false, false]);
  assert.match(toggleTask(s, D1, "nope").error, /doesn't exist/i);
});

test("a valid action clears an earlier error; dismissError clears it too", () => {
  let s = addTask(start(), D1, { title: "" });
  assert.ok(s.error);
  assert.equal(dismiss(s).error, null);
  s = addTask(s, D1, { title: "fine" });
  assert.equal(s.error, null);
  s = addTask(s, "bad", { title: "x" });
  s = selectDate(s, D2);
  assert.equal(s.error, null);
});

test("full flow: add, edit, delete across days", () => {
  let s = start();
  s = addTask(s, D1, { title: "Draft", time: "09:00" });
  s = addTask(s, D2, { title: "Review" });
  s = editTask(s, D1, idAt(s, D1, 0), { title: "Final draft" });
  s = deleteTask(s, D2, idAt(s, D2, 0));
  assert.deepEqual(s.tasksByDay, {
    [D1]: [{ id: idAt(s, D1, 0), title: "Final draft", time: "09:00", done: false }],
  });
});

test("selectors: tasks for a date and sorting", () => {
  let s = start();
  for (const v of [
    { title: "untimed 1" },
    { title: "late", time: "18:00" },
    { title: "early", time: "07:30" },
    { title: "untimed 2" },
    { title: "early too", time: "07:30" },
  ]) {
    s = addTask(s, D1, v);
  }
  const state = { planner: s };
  assert.equal(selectTasksForDate(state, D2), NO_TASKS);
  assert.equal(selectTasksForDate(state, D2), selectTasksForDate(state, "2030-01-01"));
  assert.deepEqual(
    sortTasks(selectTasksForDate(state, D1)).map((t) => t.title),
    ["early", "early too", "late", "untimed 1", "untimed 2"]
  );
});
