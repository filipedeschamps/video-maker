const readline = require('readline-sync');
const trends = require('./searchHotTrends');

async function start() {
  const searchFields = {};

  searchFields.searchTerm = await askAndReturnSearchTerm();
  searchFields.prefix = askAndReturnPrefix();

  console.log(searchFields);
  
  async function askAndReturnSearchTerm() {
    let typedTerm = readline.question('Type a search term or press <Enter> to get a list of hot terms: ');
    if (typedTerm)
      return typedTerm;
    else {
      console.log('Auto searching for hot terms online...');
      const hotTerms = await trends.searchHotTrends(9);      
      return getUserOptionInput(hotTerms, 'Choose one term: ');
    }
  }

  function getUserOptionInput(options, message) {
    const selectedOption = readline.keyInSelect(options, message);
    return options[selectedOption];
  }

  function askAndReturnPrefix() {
    const prefixes = ['Who is', 'What is', 'The history of'];
    return getUserOptionInput(prefixes, 'Choose one option: ');
  }
}

start();
