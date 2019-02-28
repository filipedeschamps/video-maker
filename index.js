import * as ask from './ask';

function start() {
  const content = {};

  content.searchTerm = ask.askAndReturnSearchTerm();
  content.prefix = ask.askAndReturnPrefix();

  console.log(content);
}

start();
