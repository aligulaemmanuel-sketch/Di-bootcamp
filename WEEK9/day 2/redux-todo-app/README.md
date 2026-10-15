# Redux Todo List

A todo list built with **React 18** and **Redux** (classic `createStore` + `connect`).

## Features

- Add, complete/uncomplete, and remove todos
- Filter by All / Active / Completed
- Clear all completed todos
- Todos persist in `localStorage`
- Works with the Redux DevTools browser extension

## Getting started

Requires Node.js 18+.

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually http://localhost:5173).

To build for production:

```bash
npm run build
npm run preview
```

## Project structure

```
src/
  redux/
    actionTypes.js   # action type constants
    actions.js       # action creators
    reducer.js       # pure reducer, immutable updates
    store.js         # createStore + localStorage persistence
  components/
    AddTodo.jsx      # form, dispatches addTodo
    TodoList.jsx     # connected list (mapStateToProps filters todos)
    TodoItem.jsx     # single todo row
    Footer.jsx       # counter, filters, clear completed
  App.jsx
  main.jsx           # wraps App in <Provider store={store}>
  styles.css
```

## Redux flow

1. A component calls an action creator (e.g. `addTodo("Buy milk")`) via `mapDispatchToProps`.
2. The action `{ type, payload }` reaches the reducer, which returns a new state object.
3. `connect` re-runs `mapStateToProps` and re-renders components whose props changed.

## Note on `createStore`

Redux 5 marks `createStore` as deprecated in favor of Redux Toolkit's `configureStore`. This project pins Redux 4 so the classic API works without warnings. Migrating to Redux Toolkit is a natural next step.
