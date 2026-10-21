# Recipe Book (TypeScript + Vite)

Add, delete and favorite recipes. Everything is saved in the browser's localStorage.

## Run it

```bash
npm install
npm run dev      # open the URL Vite prints (usually http://localhost:5173)
npm run build    # type-checks with tsc, then builds for production
npm test         # runs the recipe collection tests
```

Requires Node.js 18 or newer.

## Structure

| File | Role |
| --- | --- |
| `src/model/RecipeItem.ts` | One recipe: id (via `uuid`), title, ingredients, instructions, isFavorite |
| `src/model/RecipeCollection.ts` | Add, remove, toggle favorite, save to and load from localStorage |
| `src/templates/RecipeTemplate.ts` | Renders recipe cards, favorite and delete buttons, show/hide details |
| `src/main.ts` | Wires the form, the clear button, the collection and the template together |
| `index.html` | The HTML structure from the brief |

## Setting it up from scratch

```bash
npm create vite@latest recipe-book -- --template vanilla-ts
cd recipe-book
npm install
npm install uuid
```

Then copy `src/`, `index.html` and `tsconfig.json` from this project over the generated ones.
