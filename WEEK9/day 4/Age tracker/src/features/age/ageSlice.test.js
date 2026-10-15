import { describe, it, expect } from 'vitest';
import { makeStore } from '../../store';
import { ageUpAsync, ageDownAsync, setAge } from './ageSlice';

describe('age slice', () => {
  it('starts with an age and not loading', () => {
    const { age } = makeStore().getState();
    expect(age.age).toBe(20);
    expect(age.loading).toBe(false);
  });

  it('sets loading while ageUpAsync is pending, then increments the age', async () => {
    const store = makeStore();
    const promise = store.dispatch(ageUpAsync(0));
    expect(store.getState().age.loading).toBe(true);

    await promise;

    expect(store.getState().age.loading).toBe(false);
    expect(store.getState().age.age).toBe(21);
  });

  it('sets loading while ageDownAsync is pending, then decrements the age', async () => {
    const store = makeStore();
    const promise = store.dispatch(ageDownAsync(0));
    expect(store.getState().age.loading).toBe(true);

    await promise;

    expect(store.getState().age.loading).toBe(false);
    expect(store.getState().age.age).toBe(19);
  });

  it('does not let the age go below 0', async () => {
    const store = makeStore();
    store.dispatch(setAge(0));
    await store.dispatch(ageDownAsync(0));
    expect(store.getState().age.age).toBe(0);
  });
});
