# Generic Data Fetcher (React + TypeScript + Redux Toolkit)

A reusable, typed `DataFetcher` component that loads data through Redux and renders it. The demo
uses the Spoonacular "Recipe - Food - Nutrition" API on RapidAPI.

## Run it

1. Subscribe to the [Spoonacular API on RapidAPI](https://rapidapi.com/spoonacular/api/recipe-food-nutrition)
   (a free plan exists) and copy your key.
2. Create your env file and add the key:

   ```bash
   cp .env.example .env
   # then edit .env and set VITE_RAPIDAPI_KEY
   ```

3. Install and start:

   ```bash
   npm install
   npm run dev      # open the URL Vite prints (usually http://localhost:5173)
   npm run build    # type-checks with tsc, then builds for production
   ```

Requires Node.js 18 or newer. Restart `npm run dev` after changing `.env`.

If requests fail with an authentication or "not found" error, open the API's page on RapidAPI,
copy the host from its code snippet into `VITE_RAPIDAPI_HOST`, and check the endpoint paths in
`src/api/api.ts`.

## Files

| File | Role |
| --- | --- |
| `src/types/types.ts` | Types for recipes, API responses, request state (`DataEntry<T>`) |
| `src/api/api.ts` | `fetchData<T>()`, an API helper with typed results and readable errors |
| `src/features/dataSlice.ts` | Redux slice: one entry per request key, `loadData` thunk, `selectEntry<T>()` |
| `src/components/DataFetcher.tsx` | The generic component: `DataFetcher<TResponse, TItem>` |
| `src/App.tsx` | Uses the same component for two different responses (search and random recipes) |
| `src/app/store.ts`, `src/app/hooks.ts` | Store setup and typed Redux hooks |

## How the generics work

```tsx
<DataFetcher<ComplexSearchResponse, Recipe>
  dataKey="recipe-search"
  endpoint={ENDPOINTS.search}
  params={{ query, number: 6 }}
  getItems={(response) => response.results}
  renderItem={(recipe) => <h3>{recipe.title}</h3>}
/>
```

- `TResponse` is the shape of the whole API response and types `getItems`.
- `TItem` is the shape of one list item and types `renderItem`.
- `TItem` must have an `id`, which is used as the React key.

## Error handling

Missing API key, network failure, bad status codes (401/403, 404, 429, 5xx), invalid JSON and an
unexpected response shape each show a readable message with a "Try again" button.

## Notes

- Requests are skipped when the same request already succeeded or is in flight, so React
  StrictMode's double effect in development does not use up your quota.
- A late response for an outdated request is ignored.
- Vite embeds `VITE_` variables in the browser bundle, so your key is visible to anyone who can
  open the built site. That is fine for learning; for a real app, call the API from a backend.
