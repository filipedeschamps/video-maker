const readline = require('readline-sync');

export function askAndReturnSearchTerm() {
  return readline.question('Type a Wikipedia search term: ');
}

export function askAndReturnPrefix() {
  const prefixes = ['Who is', 'What is', 'The history of'];
  const selectedPrefixIndex = readline.keyInSelect(prefixes, 'Choose one option: ');
  const selectedPrefixText = prefixes[selectedPrefixIndex];

  return selectedPrefixText;
}
