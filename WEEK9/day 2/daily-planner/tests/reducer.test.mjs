import test from "node:test";
import assert from "node:assert/strict";
import reducer, { createInitialState } from "../src/redux/reducer.js";
import {
  selectDate,
  addTask,
  editTask,
  deleteTask,
  toggleTask,
  dismissError,
} from "../src/redux/actions.js";
import { getTasksForDate, sortTasks, NO_TASKS } from "../src/redux/selectors.js";

const D1 = "2026-10-12";
const D2 = "2026-10-13";
const start = () => createInitialState(D1);
const run = (state, ...actions) => actions.reduce(reducer, state);

test("initial state selects today and has no tasks", () => {
  const s = reducer(undefined, { type: "@@INIT" });
  assert.deepEqual(s.tasksByDay, {});
  assert.match(s.selectedDate, /^\d{4}-\d{2}-\d{2}$/);
  assert.equal(s.error, null);
});

test("selectDate changes the selected day; invalid dates are rejected", () => {
  const s = run(start(), selectDate(D2));
  assert.equal(s.selectedDate, D2);

  for (const bad of ["", "tomorrow", "2026-02-30", "2026-13-01", "12/10/2026", null]) {
    const r = reducer(s, selectDate(bad));
    assert.equal(r.selectedDate, D2, `kept date for ${bad}`);
    assert.match(r.error, /valid date/i);
  }
});

test("adds tasks to specific days and keeps days separate", () => {
  const s = run(
    start(),
    addTask(D1, { title: "Gym", time: "07:00" }),
    addTask(D1, { title: "Write report" }),
    addTask(D2, { title: "Dentist", time: "15:30" })
  );
  assert.deepEqual(s.tasksByDay[D1].map((t) => t.title), ["Gym", "Write report"]);
  assert.deepEqual(s.tasksByDay[D2].map((t) => t.title), ["Dentist"]);
  assert.equal(s.tasksByDay[D1][0].done, false);
  assert.equal(s.tasksByDay[D1][1].time, "");
  assert.equal(s.error, null);
});

test("trims titles", () => {
  const s = run(start(), addTask(D1, { title: "   padded   " }));
  assert.equal(s.tasksByDay[D1][0].title, "padded");
});

test("add validation: empty, too long, bad time, bad date", () => {
  const s = start();
  const cases = [
    [addTask(D1, { title: "   " }), /empty/i],
    [addTask(D1, { title: "x".repeat(101) }), /100 characters/i],
    [addTask(D1, { title: "ok", time: "25:00" }), /time/i],
    [addTask(D1, { title: "ok", time: "9:30" }), /time/i],
    [addTask("nope", { title: "ok" }), /valid date/i],
  ];
  for (const [action, pattern] of cases) {
    const r = reducer(s, action);
    assert.deepEqual(r.tasksByDay, {});
    assert.match(r.error, pattern);
  }
});

test("edits a task's title and time without touching others", () => {
  const a = addTask(D1, { title: "A", time: "09:00" });
  const b = addTask(D1, { title: "B" });
  let s = run(start(), a, b);
  s = run(s, editTask(D1, a.payload.id, { title: "A edited", time: "10:15" }));
  assert.equal(s.tasksByDay[D1][0].title, "A edited");
  assert.equal(s.tasksByDay[D1][0].time, "10:15");
  assert.equal(s.tasksByDay[D1][1].title, "B");
  assert.equal(s.tasksByDay[D1][0].id, a.payload.id);
});

test("edit can change only one field, and can clear the time", () => {
  const a = addTask(D1, { title: "A", time: "09:00" });
  let s = run(start(), a);
  s = run(s, editTask(D1, a.payload.id, { title: "A2" }));
  assert.deepEqual(
    [s.tasksByDay[D1][0].title, s.tasksByDay[D1][0].time],
    ["A2", "09:00"]
  );
  s = run(s, editTask(D1, a.payload.id, { time: "" }));
  assert.equal(s.tasksByDay[D1][0].time, "");
});

test("edit validation and missing-task errors leave state unchanged", () => {
  const a = addTask(D1, { title: "A" });
  const s = run(start(), a);

  const empty = reducer(s, editTask(D1, a.payload.id, { title: " " }));
  assert.equal(empty.tasksByDay, s.tasksByDay);
  assert.match(empty.error, /empty/i);

  const missing = reducer(s, editTask(D1, "nope", { title: "x" }));
  assert.equal(missing.tasksByDay, s.tasksByDay);
  assert.match(missing.error, /doesn't exist/i);

  const wrongDay = reducer(s, editTask(D2, a.payload.id, { title: "x" }));
  assert.match(wrongDay.error, /doesn't exist/i);

  const badDate = reducer(s, editTask("nope", a.payload.id, { title: "x" }));
  assert.match(badDate.error, /valid date/i);
});

test("deletes a task; removes the day key when its last task goes", () => {
  const a = addTask(D1, { title: "A" });
  const b = addTask(D1, { title: "B" });
  let s = run(start(), a, b);
  s = run(s, deleteTask(D1, a.payload.id));
  assert.deepEqual(s.tasksByDay[D1].map((t) => t.title), ["B"]);
  s = run(s, deleteTask(D1, b.payload.id));
  assert.equal(D1 in s.tasksByDay, false);
  assert.deepEqual(s.tasksByDay, {});
});

test("deleting a missing task or from a bad date sets an error only", () => {
  const a = addTask(D1, { title: "A" });
  const s = run(start(), a);
  const missing = reducer(s, deleteTask(D1, "nope"));
  assert.equal(missing.tasksByDay, s.tasksByDay);
  assert.match(missing.error, /doesn't exist/i);
  assert.match(reducer(s, deleteTask("bad", a.payload.id)).error, /valid date/i);
});

test("toggle flips done for one task only", () => {
  const a = addTask(D1, { title: "A" });
  const b = addTask(D1, { title: "B" });
  let s = run(start(), a, b, toggleTask(D1, a.payload.id));
  assert.equal(s.tasksByDay[D1][0].done, true);
  assert.equal(s.tasksByDay[D1][1].done, false);
  s = run(s, toggleTask(D1, a.payload.id));
  assert.equal(s.tasksByDay[D1][0].done, false);
  assert.match(reducer(s, toggleTask(D1, "nope")).error, /doesn't exist/i);
});

test("a valid action clears an earlier error; dismissError clears it too", () => {
  let s = reducer(start(), addTask(D1, { title: "" }));
  assert.ok(s.error);
  assert.equal(reducer(s, dismissError()).error, null);
  s = reducer(s, addTask(D1, { title: "fine" }));
  assert.equal(s.error, null);
  // dismissing when there's no error keeps the same state object
  assert.equal(reducer(s, dismissError()), s);
});

test("reducer never mutates previous state", () => {
  const a = addTask(D1, { title: "A", time: "08:00" });
  const before = run(start(), a, addTask(D2, { title: "B" }));
  const snapshot = JSON.stringify(before);
  run(
    before,
    addTask(D1, { title: "C" }),
    editTask(D1, a.payload.id, { title: "A2" }),
    toggleTask(D1, a.payload.id),
    deleteTask(D1, a.payload.id),
    selectDate(D2)
  );
  assert.equal(JSON.stringify(before), snapshot);
});

test("selectors: tasks for a date and sorting", () => {
  const s = run(
    start(),
    addTask(D1, { title: "untimed 1" }),
    addTask(D1, { title: "late", time: "18:00" }),
    addTask(D1, { title: "early", time: "07:30" }),
    addTask(D1, { title: "untimed 2" }),
    addTask(D1, { title: "early too", time: "07:30" })
  );
  assert.equal(getTasksForDate(s, D2), NO_TASKS);
  assert.equal(getTasksForDate(s, D2), getTasksForDate(s, "2030-01-01"));
  assert.deepEqual(
    sortTasks(getTasksForDate(s, D1)).map((t) => t.title),
    ["early", "early too", "late", "untimed 1", "untimed 2"]
  );
});
