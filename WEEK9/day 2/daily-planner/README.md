# Daily Planner

A daily planner built with **React 18** and **Redux** (classic `createStore` + `connect`).
Pick a day on the calendar, then add, edit, complete, and delete that day's tasks.

## Features

- Month calendar to pick any day, plus Previous day / Today / Next day buttons
- Days that have tasks show a dot on the calendar
- Add tasks with a title and an optional time; tasks are sorted by time
- Edit tasks inline (title and time) and delete them (with confirmation)
- Tick tasks off; each day shows "X of Y done"
- Validation: empty or over-long titles, invalid times and invalid dates are rejected with a clear message
- Tasks persist in `localStorage` (corrupted saved data is ignored safely)
- Works with the Redux DevTools browser extension

## Getting started

Requires Node.js 18+.

```bash
npm install
npm run dev      # then open the URL Vite prints (usually http://localhost:5173)
npm test         # date helpers, reducer and persistence tests (no browser needed)
npm run build    # production build into dist/
```

## State shape

```js
{
  tasksByDay: {
    "2026-10-12": [{ id, title, time: "09:30" | "", done }]
  },
  selectedDate: "2026-10-12",
  error: string | null
}
```

Days are local `YYYY-MM-DD` keys. A day with no tasks has no key. Invalid actions never
change `tasksByDay`; the reducer only sets `error`, which the next valid action (or the
banner's x button) clears.

## Actions

| Action creator | Payload |
| --- | --- |
| `selectDate(date)` | `{ date }` |
| `addTask(date, { title, time })` | `{ date, id, title, time }` |
| `editTask(date, id, { title?, time? })` | `{ date, id, changes }` |
| `deleteTask(date, id)` | `{ date, id }` |
| `toggleTask(date, id)` | `{ date, id }` |
| `dismissError()` | none |

## Project structure

```
src/
  utils/
    dates.js         # date-key helpers, month grid, formatting
    validation.js    # validateTask, shared by the forms and the reducer
  redux/
    actionTypes.js
    actions.js       # action creators (always take the day)
    reducer.js       # pure reducer, immutable updates, error handling
    selectors.js     # getTasksForDate, sortTasks
    persist.js       # restoreState: sanitizes saved localStorage data
    store.js         # createStore + localStorage persistence
  components/
    DatePicker.jsx   # connected: calendar + day navigation
    TaskList.jsx     # connected: tasks for the selected day
    AddTask.jsx      # connected, reusable: takes a date prop
    TaskItem.jsx     # presentational: one task, inline edit form
    ErrorBanner.jsx  # connected: shows state.error
  App.jsx
  main.jsx           # wraps App in <Provider store={store}>
tests/
  reducer.test.mjs
  dates.test.mjs
  persist.test.mjs
```

## Ideas for next steps

- Recurring tasks, task notes or priorities
- Drag to reorder, or move a task to another day
- Migrate to Redux Toolkit (`configureStore`, `createSlice`). Redux 5 marks `createStore`
  as deprecated, so this project pins Redux 4.
- Sync to a backend instead of `localStorage`
