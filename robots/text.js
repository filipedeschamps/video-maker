const algorithmia = require('algorithmia')
const algorithmiaApiKey = require('../credentials/algorithmia.json').apiKey
const sentenceBoundaryDetection = require('sbd')
const readline = require('readline-sync')

async function robot(content) {
  if(askAboutFormOfGetContentOriginal() === 0){
    await getContentTyped(content)
  }else{
    await fetchContentFromWikipedia(content)
  }
  
  sanitizeContent(content)
  breakContentIntoSentences(content)

  function askAboutFormOfGetContentOriginal() {
    const prefixes = ['Send', 'Wikipedia']
    const selectedPrefixIndex = readline.keyInSelect(prefixes, 'Choose one option: ')

    return selectedPrefixIndex
  }

  function getContentTyped(content){
    let phrase;
    while(phrase != "end"){
      phrase = readline.question('Type the content: ')
      if(phrase != "end"){
        content.sourceContentOriginal += phrase
      }
    }
  }

  async function fetchContentFromWikipedia(content) {
    const algorithmiaAuthenticated = algorithmia(algorithmiaApiKey)
    const wikipediaAlgorithm = algorithmiaAuthenticated.algo('web/WikipediaParser/0.1.2')
    const wikipediaResponde = await wikipediaAlgorithm.pipe(content.searchTerm)
    const wikipediaContent = wikipediaResponde.get()

    content.sourceContentOriginal = wikipediaContent.content
  }

  function sanitizeContent(content) {
    const withoutBlankLinesAndMarkdown = removeBlankLinesAndMarkdown(content.sourceContentOriginal)
    const withoutDatesInParentheses = removeDatesInParentheses(withoutBlankLinesAndMarkdown)

    content.sourceContentSanitized = withoutDatesInParentheses

    function removeBlankLinesAndMarkdown(text) {
      console.log(text)
      const allLines = text.split('\n')

      const withoutBlankLinesAndMarkdown = allLines.filter((line) => {
        if (line.trim().length === 0 || line.trim().startsWith('=')) {
          return false
        }

        return true
      })

      return withoutBlankLinesAndMarkdown.join(' ')
    }
  }

  function removeDatesInParentheses(text) {
    return text.replace(/\((?:\([^()]*\)|[^()])*\)/gm, '').replace(/  /g,' ')
  }

  function breakContentIntoSentences(content) {
    content.sentences = []

    const sentences = sentenceBoundaryDetection.sentences(content.sourceContentSanitized)
    sentences.forEach((sentence) => {
      content.sentences.push({
        text: sentence,
        keywords: [],
        images: []
      })
    })
  }

}

module.exports = robot
