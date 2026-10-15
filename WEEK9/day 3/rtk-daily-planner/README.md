# Daily Planner: React-Redux + Redux Toolkit

A daily planner built with **Redux Toolkit** (`createSlice`, `configureStore`) and the
React-Redux hooks `useSelector` and `useDispatch`. Pick a day on the calendar, then add,
edit, complete and delete that day's tasks.

## Getting started

Requires Node.js 18+.

```bash
npm install
npm run dev      # then open the URL Vite prints (usually http://localhost:5173)
npm test         # reducer, selector, date, validation and persistence tests
npm run build    # production build into dist/
```

## How it maps to the exercise

| Step | Where |
| --- | --- |
| 1. Store with `configureStore`, state keyed by day | `src/app/store.js`, `src/features/planner/plannerSlice.js` |
| 2. `addTask`, `editTask`, `deleteTask` actions and reducers | `src/features/planner/plannerReducers.js` (plus `toggleTask`, `selectDate`, `dismissError`) |
| 3. Calendar / date picker | `DatePicker.jsx` (month grid, day arrows, Today) |
| 4. `TaskList`, `AddTask`, `EditTask`, `DeleteTask` | `src/features/planner/*.jsx` |
| 5. `useSelector` / `useDispatch` | `TaskList`, `DatePicker` and `ErrorBanner` read; `AddTask`, `EditTask`, `DeleteTask`, `TaskItem` dispatch |
| 6. List follows the selected day | `TaskList` selects `selectedDate`, then that day's tasks |

## State

```js
{
  planner: {
    tasksByDay: { "2026-10-12": [{ id, title, time: "09:30" | "", done }] },
    selectedDate: "2026-10-12",
    error: string | null
  }
}
```

Days are local `YYYY-MM-DD` keys, and a day with no tasks has no key. Invalid actions never
change `tasksByDay`; the reducer only sets `error`, which the next valid action (or the
banner's x button) clears.

## Actions

| Action creator | Payload |
| --- | --- |
| `selectDate(date)` | `date` |
| `addTask(date, { title, time })` | `{ date, id, title, time }` |
| `editTask(date, id, { title?, time? })` | `{ date, id, changes }` |
| `deleteTask(date, id)` | `{ date, id }` |
| `toggleTask(date, id)` | `{ date, id }` |
| `dismissError()` | none |

`addTask`, `editTask`, `deleteTask` and `toggleTask` use `prepare` callbacks to build their
payloads, so the id is generated outside the reducer and the reducer stays pure.

## Notes

- The reducers are written in the "mutating" style (`push`, `splice`, `task.done = ...`).
  That is safe because `createSlice` wraps them in Immer, which produces a new immutable state.
- Validation (empty or over-long titles, bad times, impossible dates) lives in
  `src/utils/validation.js` and runs in the forms for instant feedback and again in the reducer.
- Tasks persist in `localStorage`; corrupted saved data is dropped instead of crashing the app.
- `configureStore` enables the Redux DevTools extension automatically.

## Manual test checklist (npm run dev)

1. Click different days in the calendar: the right-hand list changes to that day's tasks.
2. Add a task (with and without a time): it appears, sorted by time. An empty title shows an error.
3. Click Edit, change the title or time, press Save (Escape or Cancel discards).
4. Click Delete and confirm: the task disappears. Days with tasks show a dot on the calendar.
5. Tick a task: it is struck through and "X of Y done" updates.
6. Reload the page: your tasks are still there.
7. With Redux DevTools open, each action (`planner/addTask`, `planner/editTask`, ...) shows its payload.
