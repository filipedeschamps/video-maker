const readline = require('readline-sync');
const trends = require('./searchHotTrends');

function start() {
  const searchFields = {};

  askAndReturnSearchTerm()
      .then(term => {
        searchFields.searchTerm = term;
        searchFields.prefix = askAndReturnPrefix();
        console.log(searchFields);
      });

  function askAndReturnSearchTerm() {
    let typedTerm = readline.question('Type a search term or press <Enter> to get a list of hot terms: ');
    if (typedTerm)
      return new Promise(resolve => resolve(typedTerm));
    else {
      console.log('Auto searching for hot terms online...');
      return trends.searchHotTrends()
          .then(function (hotTerms) {
            return getUserOptionInput(hotTerms, 'Choose on term: ');
          });
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
