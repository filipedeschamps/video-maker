import * as ask from './ask';

jest.mock('readline-sync');

const readline = require('readline-sync');

test('test askAndReturnSearchTerm', () => {
  ask.askAndReturnSearchTerm();
  expect(readline.question).toBeCalled();
});

test('test askAndReturnPrefix', () => {
  ask.askAndReturnPrefix();
  expect(readline.keyInSelect).toBeCalled();
});
