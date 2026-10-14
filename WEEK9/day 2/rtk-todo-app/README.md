# Todo List: React-Redux + Redux Toolkit

A basic todo list using **Redux Toolkit** (`createSlice`, `configureStore`) and the
React-Redux hooks `useSelector` and `useDispatch`.

## Getting started

Requires Node.js 18+.

```bash
npm install
npm run dev      # then open the URL Vite prints (usually http://localhost:5173)
npm test         # unit tests for the reducer logic
npm run build    # production build into dist/
```

## How it maps to the exercise

| Step | Where |
| --- | --- |
| 1. Slice with `addTodo`, `toggleTodo`, `removeTodo` | `src/features/todos/todosSlice.js` (case reducers live in `todoReducers.js`) |
| 2. Store with `configureStore` | `src/app/store.js` |
| 3. `TodoList`, `AddTodo`, `TodoItem` | `src/features/todos/*.jsx` |
| 4. `useSelector` / `useDispatch` | `TodoList` reads with `useSelector`; `AddTodo` and `TodoItem` dispatch with `useDispatch` |
| 5. Tests | `tests/todoReducers.test.mjs`, plus the manual checklist below |

## State

```js
{ todos: [{ id: string, text: string, completed: boolean }] }
```

## Notes

- The reducers are written in the "mutating" style (`state.push(...)`, `todo.completed = !todo.completed`).
  That is safe because `createSlice` wraps them in Immer, which produces a new immutable state.
- `addTodo` uses a `prepare` callback so the id is generated outside the reducer, keeping the reducer pure.
- Empty or whitespace-only todos are ignored, and todos persist in `localStorage`.
- `configureStore` enables the Redux DevTools extension automatically.

## Manual test checklist (npm run dev)

1. Type a todo and press Add: it appears and the input clears. An empty input does nothing.
2. Click a checkbox: the text is struck through and "items left" drops by one. Click again to undo.
3. Click x: the todo disappears.
4. Reload the page: your todos are still there.
5. With Redux DevTools open, each action (`todos/addTodo`, `todos/toggleTodo`, `todos/removeTodo`) shows up with its payload.
