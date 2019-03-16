const readline = require('readline-sync')
const robots = {
  text: require('./robots/text.js')
}

async function start() {
  const content = {
    maximumSentences: 7
  }

  content.searchTerm = await askAndReturnSearchTerm()
  content.prefix = askAndReturnPrefix()

  await robots.text(content)
  await askAndReturnPossibleTitles()
  await robots.text(content)

  function askAndReturnSearchTerm() {
    return readline.question('Type a Wikipedia search term: ')
  }

  async function askAndReturnPossibleTitles() {
    const titlesPrefixes = content.titlePrefixes
    const selectedTitlePrefixIndex = readline.keyInSelect(titlesPrefixes, 'Choose one title:')
    const selectedTitlePrefixText = titlesPrefixes[selectedTitlePrefixIndex]

    content.selectedTerm = selectedTitlePrefixText
  }

  function askAndReturnPrefix() {
    const prefixes = ['Who is', 'What is', 'The history of']
    const selectedPrefixIndex = readline.keyInSelect(prefixes, 'Choose one option: ')
    const selectedPrefixText = prefixes[selectedPrefixIndex]

    return selectedPrefixText
  }

  console.log(JSON.stringify(content, null, 4))
}

start()
