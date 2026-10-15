import test from "node:test";
import assert from "node:assert/strict";
import { todoReducers } from "../src/features/todos/todoReducers.js";

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

const add = (state, text) => {
  const action = { type: "todos/addTodo", ...todoReducers.addTodo.prepare(text) };
  return apply(todoReducers.addTodo.reducer, state, action);
};
const toggle = (state, id) =>
  apply(todoReducers.toggleTodo, state, { type: "todos/toggleTodo", payload: id });
const remove = (state, id) =>
  apply(todoReducers.removeTodo, state, { type: "todos/removeTodo", payload: id });

test("addTodo prepare builds a payload with an id and the text", () => {
  const { payload } = todoReducers.addTodo.prepare("Buy milk");
  assert.equal(payload.text, "Buy milk");
  assert.equal(typeof payload.id, "string");
  assert.ok(payload.id.length > 0);
});

test("ids are unique", () => {
  const ids = new Set(
    Array.from({ length: 500 }, () => todoReducers.addTodo.prepare("x").payload.id)
  );
  assert.equal(ids.size, 500);
});

test("adds todos, not completed, in order", () => {
  let s = [];
  s = add(s, "one");
  s = add(s, "two");
  assert.deepEqual(s.map((t) => [t.text, t.completed]), [
    ["one", false],
    ["two", false],
  ]);
});

test("trims text and ignores empty or whitespace-only todos", () => {
  let s = add([], "  padded  ");
  assert.equal(s[0].text, "padded");
  assert.equal(add(s, "").length, 1);
  assert.equal(add(s, "   ").length, 1);
});

test("addTodo ignores a non-string text", () => {
  const action = { type: "todos/addTodo", payload: { id: "x", text: 42 } };
  assert.deepEqual(apply(todoReducers.addTodo.reducer, [], action), []);
});

test("toggleTodo flips completion for only the matching todo", () => {
  let s = add(add([], "a"), "b");
  const [a, b] = s;
  s = toggle(s, a.id);
  assert.equal(s[0].completed, true);
  assert.equal(s[1].completed, false);
  s = toggle(s, a.id);
  assert.equal(s[0].completed, false);
  assert.equal(s[1].id, b.id);
});

test("toggleTodo with an unknown id changes nothing", () => {
  const s = add([], "a");
  assert.deepEqual(toggle(s, "nope"), s);
});

test("removeTodo removes only the matching todo", () => {
  let s = add(add(add([], "a"), "b"), "c");
  const ids = s.map((t) => t.id);
  s = remove(s, ids[1]);
  assert.deepEqual(s.map((t) => t.text), ["a", "c"]);
});

test("removeTodo with an unknown id changes nothing, and can empty the list", () => {
  let s = add([], "a");
  assert.deepEqual(remove(s, "nope"), s);
  s = remove(s, s[0].id);
  assert.deepEqual(s, []);
});

test("full flow: add, complete, remove", () => {
  let s = [];
  s = add(s, "write tests");
  s = add(s, "ship it");
  s = toggle(s, s[0].id);
  assert.deepEqual(s.map((t) => t.completed), [true, false]);
  s = remove(s, s[0].id);
  assert.deepEqual(s.map((t) => t.text), ["ship it"]);
});
