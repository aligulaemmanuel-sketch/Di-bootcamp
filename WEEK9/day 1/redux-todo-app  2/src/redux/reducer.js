import {
  ADD_CATEGORY,
  REMOVE_CATEGORY,
  ADD_TODO,
  TOGGLE_TODO,
  REMOVE_TODO,
  CLEAR_COMPLETED,
  SET_FILTER,
  DISMISS_ERROR,
} from "./actionTypes.js";

/*
 * State shape:
 * {
 *   categories: [
 *     { id, name, todos: [{ id, text, completed }] }
 *   ],
 *   filter: "all" | "active" | "completed",
 *   error: string | null      // set when an action is invalid; cleared by the next valid action
 * }
 */
export const DEFAULT_CATEGORY_ID = "general";

export const initialState = {
  categories: [{ id: DEFAULT_CATEGORY_ID, name: "General", todos: [] }],
  filter: "all",
  error: null,
};

const fail = (state, message) => ({ ...state, error: message });
const ok = (state, changes) => ({ ...state, ...changes, error: null });

const findCategory = (state, categoryId) =>
  state.categories.find((c) => c.id === categoryId);

// Replace one category immutably, using updater(category) => newCategory.
const updateCategory = (state, categoryId, updater) =>
  state.categories.map((c) => (c.id === categoryId ? updater(c) : c));

export default function todoReducer(state = initialState, action) {
  switch (action.type) {
    case ADD_CATEGORY: {
      const name = (action.payload.name || "").trim();
      if (!name) return fail(state, "Category name can't be empty.");
      const exists = state.categories.some(
        (c) => c.name.toLowerCase() === name.toLowerCase()
      );
      if (exists) return fail(state, `Category "${name}" already exists.`);
      return ok(state, {
        categories: [
          ...state.categories,
          { id: action.payload.id, name, todos: [] },
        ],
      });
    }

    case REMOVE_CATEGORY: {
      const { categoryId } = action.payload;
      if (!findCategory(state, categoryId)) {
        return fail(state, "That category doesn't exist.");
      }
      if (state.categories.length === 1) {
        return fail(state, "You need at least one category.");
      }
      return ok(state, {
        categories: state.categories.filter((c) => c.id !== categoryId),
      });
    }

    case ADD_TODO: {
      const { categoryId, id } = action.payload;
      const text = (action.payload.text || "").trim();
      if (!findCategory(state, categoryId)) {
        return fail(state, "Can't add a todo to a category that doesn't exist.");
      }
      if (!text) return fail(state, "Todo text can't be empty.");
      return ok(state, {
        categories: updateCategory(state, categoryId, (c) => ({
          ...c,
          todos: [...c.todos, { id, text, completed: false }],
        })),
      });
    }

    case TOGGLE_TODO: {
      const { categoryId, todoId } = action.payload;
      const category = findCategory(state, categoryId);
      if (!category) return fail(state, "That category doesn't exist.");
      if (!category.todos.some((t) => t.id === todoId)) {
        return fail(state, "That todo doesn't exist in this category.");
      }
      return ok(state, {
        categories: updateCategory(state, categoryId, (c) => ({
          ...c,
          todos: c.todos.map((t) =>
            t.id === todoId ? { ...t, completed: !t.completed } : t
          ),
        })),
      });
    }

    case REMOVE_TODO: {
      const { categoryId, todoId } = action.payload;
      const category = findCategory(state, categoryId);
      if (!category) return fail(state, "That category doesn't exist.");
      if (!category.todos.some((t) => t.id === todoId)) {
        return fail(state, "That todo doesn't exist in this category.");
      }
      return ok(state, {
        categories: updateCategory(state, categoryId, (c) => ({
          ...c,
          todos: c.todos.filter((t) => t.id !== todoId),
        })),
      });
    }

    case CLEAR_COMPLETED:
      return ok(state, {
        categories: state.categories.map((c) => ({
          ...c,
          todos: c.todos.filter((t) => !t.completed),
        })),
      });

    case SET_FILTER:
      return ok(state, { filter: action.payload.filter });

    case DISMISS_ERROR:
      return state.error ? { ...state, error: null } : state;

    default:
      return state;
  }
}
