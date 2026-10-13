import test from "node:test";
import assert from "node:assert/strict";
import reducer, { initialState, DEFAULT_CATEGORY_ID } from "../src/redux/reducer.js";
import { migrateState } from "../src/redux/persist.js";
import {
  addCategory,
  removeCategory,
  addTodo,
  toggleTodo,
  removeTodo,
  clearCompleted,
  setFilter,
  dismissError,
} from "../src/redux/actions.js";

const run = (state, ...actions) => actions.reduce(reducer, state);
const cat = (state, id) => state.categories.find((c) => c.id === id);

test("starts with a General category", () => {
  const s = reducer(undefined, { type: "@@INIT" });
  assert.equal(s.categories.length, 1);
  assert.equal(s.categories[0].name, "General");
});

test("adds categories, trims names, rejects empty and duplicate names", () => {
  let s = run(initialState, addCategory("  Work  "));
  assert.deepEqual(s.categories.map((c) => c.name), ["General", "Work"]);
  assert.equal(s.error, null);

  const empty = reducer(s, addCategory("   "));
  assert.equal(empty.categories.length, 2);
  assert.match(empty.error, /empty/i);

  const dup = reducer(s, addCategory("work"));
  assert.equal(dup.categories.length, 2);
  assert.match(dup.error, /already exists/i);
});

test("todos stay in the category they were added to", () => {
  const work = addCategory("Work");
  const workId = work.payload.id;
  let s = run(
    initialState,
    work,
    addTodo(DEFAULT_CATEGORY_ID, "buy milk"),
    addTodo(workId, "write report"),
    addTodo(workId, "email boss")
  );
  assert.deepEqual(cat(s, DEFAULT_CATEGORY_ID).todos.map((t) => t.text), ["buy milk"]);
  assert.deepEqual(cat(s, workId).todos.map((t) => t.text), ["write report", "email boss"]);
});

test("toggle only affects the targeted todo", () => {
  const work = addCategory("Work");
  const a = addTodo(work.payload.id, "a");
  const b = addTodo(work.payload.id, "b");
  const other = addTodo(DEFAULT_CATEGORY_ID, "c");
  let s = run(initialState, work, a, b, other);
  s = run(s, toggleTodo(work.payload.id, a.payload.id));
  const todos = cat(s, work.payload.id).todos;
  assert.equal(todos[0].completed, true);
  assert.equal(todos[1].completed, false);
  assert.equal(cat(s, DEFAULT_CATEGORY_ID).todos[0].completed, false);
  s = run(s, toggleTodo(work.payload.id, a.payload.id));
  assert.equal(cat(s, work.payload.id).todos[0].completed, false);
});

test("removes a todo from its category only", () => {
  const work = addCategory("Work");
  const a = addTodo(work.payload.id, "a");
  const c = addTodo(DEFAULT_CATEGORY_ID, "c");
  let s = run(initialState, work, a, c);
  s = run(s, removeTodo(work.payload.id, a.payload.id));
  assert.equal(cat(s, work.payload.id).todos.length, 0);
  assert.equal(cat(s, DEFAULT_CATEGORY_ID).todos.length, 1);
});

test("errors: unknown category / unknown todo / empty text leave data untouched", () => {
  const a = addTodo(DEFAULT_CATEGORY_ID, "a");
  const s = run(initialState, a);

  const noCat = reducer(s, addTodo("nope", "x"));
  assert.deepEqual(noCat.categories, s.categories);
  assert.match(noCat.error, /doesn't exist/i);

  const noTodoToggle = reducer(s, toggleTodo(DEFAULT_CATEGORY_ID, "nope"));
  assert.deepEqual(noTodoToggle.categories, s.categories);
  assert.match(noTodoToggle.error, /doesn't exist/i);

  const noTodoRemove = reducer(s, removeTodo(DEFAULT_CATEGORY_ID, "nope"));
  assert.deepEqual(noTodoRemove.categories, s.categories);
  assert.match(noTodoRemove.error, /doesn't exist/i);

  const noCatRemove = reducer(s, removeTodo("nope", a.payload.id));
  assert.match(noCatRemove.error, /doesn't exist/i);

  const emptyText = reducer(s, addTodo(DEFAULT_CATEGORY_ID, "   "));
  assert.equal(cat(emptyText, DEFAULT_CATEGORY_ID).todos.length, 1);
  assert.match(emptyText.error, /empty/i);
});

test("a valid action clears a previous error; dismissError clears it too", () => {
  let s = reducer(initialState, addTodo("nope", "x"));
  assert.ok(s.error);
  assert.equal(reducer(s, dismissError()).error, null);
  s = reducer(s, addTodo(DEFAULT_CATEGORY_ID, "ok"));
  assert.equal(s.error, null);
});

test("removing a category deletes it; the last category can't be removed", () => {
  const work = addCategory("Work");
  let s = run(initialState, work);
  s = run(s, removeCategory(work.payload.id));
  assert.deepEqual(s.categories.map((c) => c.id), [DEFAULT_CATEGORY_ID]);

  const last = reducer(s, removeCategory(DEFAULT_CATEGORY_ID));
  assert.equal(last.categories.length, 1);
  assert.match(last.error, /at least one/i);

  const missing = reducer(s, removeCategory("nope"));
  assert.match(missing.error, /doesn't exist/i);
});

test("clearCompleted works across all categories", () => {
  const work = addCategory("Work");
  const a = addTodo(work.payload.id, "a");
  const b = addTodo(DEFAULT_CATEGORY_ID, "b");
  const c = addTodo(DEFAULT_CATEGORY_ID, "c");
  let s = run(
    initialState, work, a, b, c,
    toggleTodo(work.payload.id, a.payload.id),
    toggleTodo(DEFAULT_CATEGORY_ID, b.payload.id)
  );
  s = run(s, clearCompleted());
  assert.equal(cat(s, work.payload.id).todos.length, 0);
  assert.deepEqual(cat(s, DEFAULT_CATEGORY_ID).todos.map((t) => t.text), ["c"]);
});

test("setFilter updates filter", () => {
  assert.equal(reducer(initialState, setFilter("active")).filter, "active");
});

test("reducer never mutates the previous state", () => {
  const work = addCategory("Work");
  const a = addTodo(work.payload.id, "a");
  const before = run(initialState, work, a);
  const snapshot = JSON.stringify(before);
  run(
    before,
    toggleTodo(work.payload.id, a.payload.id),
    addTodo(work.payload.id, "b"),
    removeTodo(work.payload.id, a.payload.id),
    removeCategory(work.payload.id),
    clearCompleted()
  );
  assert.equal(JSON.stringify(before), snapshot);
});

test("migrates v1 saved state ({ todos }) into a General category", () => {
  const migrated = migrateState({
    todos: [{ id: 123, text: "old todo", completed: true }],
    filter: "completed",
  });
  assert.equal(migrated.categories.length, 1);
  assert.equal(migrated.categories[0].name, "General");
  assert.deepEqual(migrated.categories[0].todos, [
    { id: "123", text: "old todo", completed: true },
  ]);
  assert.equal(migrated.filter, "completed");
});

test("v2 saved state loads; garbage returns undefined", () => {
  const v2 = migrateState({
    categories: [{ id: "x", name: "X", todos: [{ id: "1", text: "t", completed: false }] }],
    filter: "active",
  });
  assert.equal(v2.categories[0].name, "X");
  assert.equal(v2.filter, "active");
  assert.equal(v2.error, null);

  assert.equal(migrateState(null), undefined);
  assert.equal(migrateState("junk"), undefined);
  assert.equal(migrateState({ categories: [] }), undefined);
  assert.equal(migrateState({ foo: 1 }), undefined);
});
