import { initialState, DEFAULT_CATEGORY_ID } from "./reducer.js";

/*
 * Turns whatever was saved in localStorage into a valid state.
 * - v2 shape ({ categories: [...] }) is used as-is (with light validation).
 * - v1 shape ({ todos: [...] }, from the first version of the app) is migrated
 *   into a single "General" category so nobody loses their todos.
 * Anything else falls back to undefined, which lets the reducer use initialState.
 */
export function migrateState(saved) {
  if (!saved || typeof saved !== "object") return undefined;

  if (Array.isArray(saved.categories)) {
    const categories = saved.categories
      .filter((c) => c && typeof c.id === "string" && typeof c.name === "string")
      .map((c) => ({
        id: c.id,
        name: c.name,
        todos: Array.isArray(c.todos) ? c.todos : [],
      }));
    if (categories.length === 0) return undefined;
    return { ...initialState, categories, filter: saved.filter || "all" };
  }

  if (Array.isArray(saved.todos)) {
    return {
      ...initialState,
      categories: [
        {
          id: DEFAULT_CATEGORY_ID,
          name: "General",
          todos: saved.todos.map((t) => ({ ...t, id: String(t.id) })),
        },
      ],
      filter: saved.filter || "all",
    };
  }

  return undefined;
}
