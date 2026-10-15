import { describe, it, expect, vi, afterEach } from 'vitest';
import { makeStore } from '../../app/store';
import { addTodo, removeTodo, toggleTodo, fetchTodos } from './todoSlice';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('todo reducers', () => {
  it('adds a todo', () => {
    const store = makeStore();
    store.dispatch(addTodo('Write tests'));

    const { items } = store.getState().todos;
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({ title: 'Write tests', completed: false });
    expect(items[0].id).toBeTruthy();
  });

  it('toggles completion status', () => {
    const store = makeStore();
    store.dispatch(addTodo('Toggle me'));
    const { id } = store.getState().todos.items[0];

    store.dispatch(toggleTodo(id));
    expect(store.getState().todos.items[0].completed).toBe(true);

    store.dispatch(toggleTodo(id));
    expect(store.getState().todos.items[0].completed).toBe(false);
  });

  it('removes a todo', () => {
    const store = makeStore();
    store.dispatch(addTodo('Keep'));
    store.dispatch(addTodo('Delete'));
    const toDelete = store.getState().todos.items[1];

    store.dispatch(removeTodo(toDelete.id));

    const { items } = store.getState().todos;
    expect(items).toHaveLength(1);
    expect(items[0].title).toBe('Keep');
  });
});

describe('fetchTodos thunk', () => {
  it('stores fetched todos on success', async () => {
    const apiTodos = [
      { id: 1, title: 'delectus aut autem', completed: false },
      { id: 2, title: 'quis ut nam facilis', completed: true },
    ];
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: async () => apiTodos })
    );

    const store = makeStore();
    const promise = store.dispatch(fetchTodos());
    expect(store.getState().todos.loading).toBe(true);
    await promise;

    const state = store.getState().todos;
    expect(state.items).toEqual(apiTodos);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('stores an error when the request fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500 }));

    const store = makeStore();
    await store.dispatch(fetchTodos());

    const state = store.getState().todos;
    expect(state.error).toMatch(/500/);
    expect(state.loading).toBe(false);
    expect(state.items).toEqual([]);
  });
});
