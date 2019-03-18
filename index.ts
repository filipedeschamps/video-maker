import {
  keyInSelect,
  question
} from 'readline-sync'
import { IContent } from './interfaces/IContent'
import { textRobot } from './robots/text'

const robots = {
  text: textRobot
}

async function start(): Promise<string> {
  const content: IContent = {
    maximumSentences: 7
  }

  content.searchTerm = askAndReturnSearchTerm()
  content.prefix = askAndReturnPrefix()

  await robots.text(content)

  function askAndReturnSearchTerm(): string {
    return question('Type a Wikipedia search term: ')
  }

  function askAndReturnPrefix(): string {
    const prefixes = ['Who is', 'What is', 'The history of']
    const selectedPrefixIndex = keyInSelect(prefixes, 'Choose one option: ')
    const selectedPrefixText = prefixes[selectedPrefixIndex]

    return selectedPrefixText
  }

  return JSON.stringify(content, null, 4)
}

start()
  .then(console.log)
  .catch(console.error)
