// const algorithmia = require('algorithmia')
// const algorithmiaApiKey = require('../credentials/algorithmia.json').apiKey
const sentenceBoundaryDetection = require('sbd')

async function Text(content) {
  // await fetchContentFromWikipedia(content)
  sanitizeContent(content)
  breakContentIntoSentences(content)
  console.log('Build Sentences')

  /*
  *
  * Com o Robo da Wikipedia não precisamos utilizar o Algorithmia e usar nossos credito no mesmo.
  * 
  * Assim sendo passo diretamente os valores para o robo de texto e utlizo o que o robo do Wikipedia retornou para mim
  * 
  */
  // async function fetchContentFromWikipedia(content) {
  //   const algorithmiaAuthenticated = algorithmia(algorithmiaApiKey)
  //   const wikipediaAlgorithm = algorithmiaAuthenticated.algo('web/WikipediaParser/0.1.2')
  //   const wikipediaResponde = await wikipediaAlgorithm.pipe(content.searchTerm)
  //   const wikipediaContent = wikipediaResponde.get()

  //   content.sourceContentOriginal = wikipediaContent.content
  // }

  function sanitizeContent(content) {
    const withoutBlankLinesAndMarkdown = removeBlankLinesAndMarkdown(content.wikiPediaContent.content)
    const withoutDatesInParentheses = removeDatesInParentheses(withoutBlankLinesAndMarkdown)

    content.wikiPediaContent.sourceContentSanitized = withoutDatesInParentheses

    function removeBlankLinesAndMarkdown(text) {
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

    const sentences = sentenceBoundaryDetection.sentences(content.wikiPediaContent.sourceContentSanitized)
    sentences.forEach((sentence) => {
      content.sentences.push({
        text: sentence,
        keywords: [],
        images: []
      })
    })
  }

}

module.exports = Text
