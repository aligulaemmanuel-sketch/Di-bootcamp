import test from "node:test";
import assert from "node:assert/strict";
import { restoreState } from "../src/redux/persist.js";

test("restores valid saved tasks and defaults everything else", () => {
  const s = restoreState({
    tasksByDay: {
      "2026-10-12": [
        { id: "a", title: "Gym", time: "07:00", done: true },
        { id: "b", title: "Read" },
      ],
    },
  });
  assert.equal(s.tasksByDay["2026-10-12"].length, 2);
  assert.deepEqual(s.tasksByDay["2026-10-12"][1], {
    id: "b",
    title: "Read",
    time: "",
    done: false,
  });
  assert.equal(s.error, null);
  assert.match(s.selectedDate, /^\d{4}-\d{2}-\d{2}$/);
});

test("drops malformed days and tasks instead of crashing", () => {
  const s = restoreState({
    tasksByDay: {
      "not-a-date": [{ id: "x", title: "nope" }],
      "2026-10-13": "not an array",
      "2026-10-14": [
        null,
        { id: 5, title: "numeric id" },
        { id: "ok", title: "" },
        { id: "ok2", title: "bad time", time: "99:99" },
        { id: "good", title: "keep me", time: "10:00" },
      ],
      "2026-10-15": [],
    },
  });
  assert.deepEqual(Object.keys(s.tasksByDay), ["2026-10-14"]);
  assert.deepEqual(s.tasksByDay["2026-10-14"].map((t) => t.id), ["good"]);
});

test("returns undefined for unusable input", () => {
  assert.equal(restoreState(null), undefined);
  assert.equal(restoreState("junk"), undefined);
  assert.equal(restoreState({}), undefined);
  assert.equal(restoreState({ tasksByDay: [] }), undefined);
  assert.equal(restoreState({ tasksByDay: null }), undefined);
});
