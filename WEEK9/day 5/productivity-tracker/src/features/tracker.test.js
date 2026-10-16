import { describe, it, expect } from 'vitest';
import { makeStore } from '../app/store';
import {
  addTask,
  editTask,
  deleteTask,
  updateTaskProgress,
} from './tasks/tasksSlice';
import {
  addCategory,
  editCategory,
  deleteCategory,
  setSelectedCategory,
} from './categories/categoriesSlice';
import {
  selectTasks,
  selectCategories,
  selectTasksByCategory,
  selectCompletedTasks,
  selectCategoryById,
} from './selectors';

describe('task reducers', () => {
  it('adds, edits, and deletes a task', () => {
    const store = makeStore();
    const before = selectTasks(store.getState()).length;

    store.dispatch(addTask({ title: 'New', categoryId: 'cat-work' }));
    let tasks = selectTasks(store.getState());
    expect(tasks).toHaveLength(before + 1);
    const added = tasks[tasks.length - 1];
    expect(added).toMatchObject({ title: 'New', categoryId: 'cat-work', progress: 0 });

    store.dispatch(editTask({ id: added.id, changes: { title: 'Renamed' } }));
    expect(selectTasks(store.getState()).find((t) => t.id === added.id).title).toBe('Renamed');

    store.dispatch(deleteTask(added.id));
    expect(selectTasks(store.getState())).toHaveLength(before);
  });

  it('updates and clamps task progress', () => {
    const store = makeStore();
    store.dispatch(updateTaskProgress({ id: 't3', progress: 55 }));
    expect(selectTasks(store.getState()).find((t) => t.id === 't3').progress).toBe(55);
    store.dispatch(updateTaskProgress({ id: 't3', progress: 250 }));
    expect(selectTasks(store.getState()).find((t) => t.id === 't3').progress).toBe(100);
    store.dispatch(updateTaskProgress({ id: 't3', progress: -5 }));
    expect(selectTasks(store.getState()).find((t) => t.id === 't3').progress).toBe(0);
  });
});

describe('category reducers', () => {
  it('adds and edits a category', () => {
    const store = makeStore();
    store.dispatch(addCategory('Home'));
    const cats = selectCategories(store.getState());
    const home = cats[cats.length - 1];
    expect(home.name).toBe('Home');

    store.dispatch(editCategory({ id: home.id, changes: { name: 'House' } }));
    expect(selectCategoryById(store.getState(), home.id).name).toBe('House');
  });

  it('deleting a category removes its tasks and resets the filter', () => {
    const store = makeStore();
    store.dispatch(setSelectedCategory('cat-health'));
    store.dispatch(deleteCategory('cat-health'));

    const state = store.getState();
    expect(selectCategoryById(state, 'cat-health')).toBeUndefined();
    expect(selectTasks(state).some((t) => t.categoryId === 'cat-health')).toBe(false);
    expect(state.categories.selectedId).toBe('all');
  });
});

describe('selectors', () => {
  it('selectTasksByCategory filters by category and supports "all"', () => {
    const state = makeStore().getState();
    const work = selectTasksByCategory(state, 'cat-work');
    expect(work).toHaveLength(2);
    expect(work.every((t) => t.categoryId === 'cat-work')).toBe(true);
    expect(selectTasksByCategory(state, 'all')).toHaveLength(5);
  });

  it('selectCompletedTasks counts tasks at 100%', () => {
    const store = makeStore();
    expect(selectCompletedTasks(store.getState())).toBe(2);
    store.dispatch(updateTaskProgress({ id: 't2', progress: 100 }));
    expect(selectCompletedTasks(store.getState())).toBe(3);
  });

  it('selectCategoryById returns the category details', () => {
    const state = makeStore().getState();
    expect(selectCategoryById(state, 'cat-learning')).toMatchObject({ name: 'Learning' });
    expect(selectCategoryById(state, 'nope')).toBeUndefined();
  });

  it('memoizes: unchanged inputs return the same reference', () => {
    const state = makeStore().getState();
    expect(selectTasksByCategory(state, 'cat-work')).toBe(
      selectTasksByCategory(state, 'cat-work')
    );
  });
});
