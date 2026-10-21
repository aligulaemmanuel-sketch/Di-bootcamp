# React + TypeScript Exercises

Solutions for the five exercises, built on Vite with the React + TypeScript setup.

## Run it

```bash
npm install
npm run dev      # then open the URL Vite prints (usually http://localhost:5173)
npm run build    # type-checks with tsc, then builds for production
```

Requires Node.js 18 or newer.

## Where each exercise lives

| Exercise | File |
| --- | --- |
| 1. Vite + React + TypeScript project | `package.json`, `vite.config.ts`, `tsconfig*.json` |
| 2. Typed props | `src/components/Greeting.tsx` |
| 3. `useState` with types | `src/components/Counter.tsx` |
| 4. Optional props and defaults | `src/components/UserCard.tsx` |
| 5. `useEffect` and API data | `src/components/UserList.tsx` |
| Daily challenge: `Book` type | `src/types.ts` |
| Daily challenge: generic `List` | `src/components/List.tsx` |
| Daily challenge: `BookApp` with `addBook` | `src/components/BookApp.tsx` |

`src/App.tsx` renders all four components together.

## Starting from the official scaffold instead

```bash
npm create vite@latest my-app -- --template react-ts
cd my-app && npm install && npm run dev
```

Then copy `src/components/` into your project and use `src/App.tsx` as the example.
