const readline = require('readline-sync')
const imdbScrapper = require('imdb-scrapper')

async function start() {
  const content = {}

  content.searchTerm = await askAndReturnSearchTerm()
  content.prefix = askAndReturnPrefix()

  async function askAndReturnSearchTerm() {
    const suggestions = await suggestFromImdb()
    console.log(suggestions)
    const selectedSuggestionIndex = readline.keyInSelect(
      [...suggestions, 'Type another: '],
      'Choose one option: '
    )
    //selected other
    if (selectedSuggestionIndex >= suggestions.length) {
      return askAndReturnManualSearchTerm()
    }
    const selectedSuggestionText = suggestions[selectedSuggestionIndex]

    return selectedSuggestionText
  }

  function askAndReturnManualSearchTerm() {
    return readline.question('Type a Wikipedia search term: ')
  }

  function askAndReturnPrefix() {
    const prefixes = ['Who is', 'What is', 'The history of']
    const selectedPrefixIndex = readline.keyInSelect(
      prefixes,
      'Choose one option: '
    )
    const selectedPrefixText = prefixes[selectedPrefixIndex]

    return selectedPrefixText
  }

  // Should probably be extracted to external bot ('suggestions bot', for instance)
  function suggestFromImdb(how_many = 10) {
    return imdbScrapper
      .getTrending(how_many)
      .then(movies => movies.trending.map(movie => movie.name))
  }

  console.log(content)
}

start()
