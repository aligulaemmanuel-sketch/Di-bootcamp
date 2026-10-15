# Redux Todo List (with categories)

A todo list built with **React 18** and **Redux** (classic `createStore` + `connect`).
Todos belong to categories; you can add, complete, and remove todos inside each one.

## Features

- Create and delete categories (e.g. Work, Home). A "General" category exists by default.
- Add, complete/uncomplete, and remove todos within a specific category
- Filter by All / Active / Completed (applies to every category)
- "Clear completed" removes finished todos from all categories
- Friendly error banner for invalid actions (empty text, duplicate category, missing category/todo, deleting the last category)
- Everything persists in `localStorage`; todos from the earlier single-list version are migrated into "General"
- Works with the Redux DevTools browser extension

## Getting started

Requires Node.js 18+.

```bash
npm install
npm run dev      # then open the URL Vite prints (usually http://localhost:5173)
npm test         # reducer + migration tests (no browser needed)
npm run build    # production build into dist/
```

## State shape

```js
{
  categories: [
    { id, name, todos: [{ id, text, completed }] }
  ],
  filter: "all" | "active" | "completed",
  error: string | null
}
```

Invalid actions never change `categories`; the reducer just sets `error`, which the
next valid action (or the banner's × button) clears.

## Actions

| Action creator | Payload |
| --- | --- |
| `addCategory(name)` | `{ id, name }` |
| `removeCategory(categoryId)` | `{ categoryId }` |
| `addTodo(categoryId, text)` | `{ categoryId, id, text }` |
| `toggleTodo(categoryId, todoId)` | `{ categoryId, todoId }` |
| `removeTodo(categoryId, todoId)` | `{ categoryId, todoId }` |
| `clearCompleted()` | none |
| `setFilter(filter)` | `{ filter }` |
| `dismissError()` | none |

## Project structure

```
src/
  redux/
    actionTypes.js   # action type constants
    actions.js       # action creators
    reducer.js       # pure reducer, immutable updates, error handling
    persist.js       # migrates saved localStorage data (v1 -> v2)
    store.js         # createStore + localStorage persistence
  components/
    AddCategory.jsx     # connected: form that dispatches addCategory
    CategoryList.jsx    # connected: renders one CategorySection per category id
    CategorySection.jsx # connected via ownProps.categoryId: header, AddTodo, TodoList
    AddTodo.jsx         # connected, reusable: takes a categoryId prop
    TodoList.jsx        # presentational, reusable: todos + callbacks
    TodoItem.jsx        # presentational: one row
    ErrorBanner.jsx     # connected: shows state.error
    Footer.jsx          # connected: totals across categories, filters, clear completed
  App.jsx
  main.jsx           # wraps App in <Provider store={store}>
tests/
  reducer.test.mjs
```

## Note on `createStore`

Redux 5 marks `createStore` as deprecated in favor of Redux Toolkit's `configureStore`.
This project pins Redux 4 so the classic API works without warnings. Migrating to
Redux Toolkit is a natural next step.
