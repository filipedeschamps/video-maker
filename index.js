const readline = require('readline-sync')
const robots = {
  text: require('./robots/text.js'),
  imageClassifier: require('./robots/watson-visual-recognition.js'),
}

async function start() {
  const content = {}

  content.searchTerm = await askAndReturnSearchTerm()
  content.prefix = askAndReturnPrefix()

  await robots.text(content)

  async function askAndReturnSearchTerm() {
  	const response = readline.question('Type a Wikipedia search term or I to identify an image: ')

  	return (response.toUpperCase() === 'I') ?  await askAndReturnClassifiedImage() : response
  }

  async function askAndReturnClassifiedImage() {
  	const imagePath = readline.question('Type the image path: ')
  	return await robots.imageClassifier(imagePath)
  }

  function askAndReturnPrefix() {
    const prefixes = ['Who is', 'What is', 'The history of']
    const selectedPrefixIndex = readline.keyInSelect(prefixes, 'Choose one option: ')
    const selectedPrefixText = prefixes[selectedPrefixIndex]

    return selectedPrefixText
  }

  console.log(content)
}

start()