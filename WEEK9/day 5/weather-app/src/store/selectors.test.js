import assert from 'node:assert/strict';
import test from 'node:test';
import { selectIsFavorite } from './selectors.js';

const makeState = (location, favorites) => ({
  weather: { location },
  favorites: { items: favorites },
});

test('selectIsFavorite checks the selected location against favorite keys', () => {
  const location = { key: '215854', name: 'Tel Aviv' };
  const favorites = [{ key: '215854', name: 'Tel Aviv' }];

  assert.equal(selectIsFavorite(makeState(location, favorites)), true);
  assert.equal(selectIsFavorite(makeState(location, [])), false);
  assert.equal(selectIsFavorite(makeState(null, favorites)), false);
});

test('selectIsFavorite reuses its result when its inputs are unchanged', () => {
  const location = { key: '215854', name: 'Tel Aviv' };
  const favorites = [{ key: '215854', name: 'Tel Aviv' }];
  const state = makeState(location, favorites);

  assert.equal(selectIsFavorite(state), true);
  const recomputations = selectIsFavorite.recomputations();

  assert.equal(selectIsFavorite(state), true);
  assert.equal(selectIsFavorite.recomputations(), recomputations);
});
