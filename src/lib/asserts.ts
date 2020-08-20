import assert from 'assert';

export const assertString = (value, message) =>
  assert(typeof value === 'string', message);

export const assertNumber = (value, message) =>
  assert(typeof value === 'number', message);
