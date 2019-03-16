const fetch = require('node-fetch')
const sentenceBoundaryDetection = require('sbd')

const watsonApiKey = require('../credentials/watson-nlu.json').apikey
const NaturalLanguageUnderstandingV1 = require('watson-developer-cloud/natural-language-understanding/v1.js')
 
var nlu = new NaturalLanguageUnderstandingV1({
  iam_apikey: watsonApiKey,
  version: '2018-04-05',
  url: 'https://gateway.watsonplatform.net/natural-language-understanding/api/'
})

async function robot(content) {
  await getWikipediaTitleContent(content)
  await fetchContentFromWikipedia(content)
  sanitizeContent(content)
  breakContentIntoSentences(content)
  limitMaximumSentences(content)
  await fetchKeywordsOfAllSentences(content)

  async function getWikipediaTitleContent(content) {
    try {
        const response = await fetch( `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(content.searchTerm)}&utf8=&format=json`)
        const wikipediaRawTitles = await response.json()

        const wikipediaTitles = wikipediaRawTitles.query.search

        const arrayTitles = []

        for (let x in wikipediaTitles) {
            await arrayTitles.push(wikipediaTitles[x].title)
        }

        content.titlePrefixes = arrayTitles

    } catch (error) {
        console.log(error)
    }
}

  async function fetchContentFromWikipedia(content) {
    try {
        const response = await fetch(`https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exintro=true&explaintext&titles=${encodeURIComponent(content.selectedTerm)}&format=json`)
        const wikipediaRawResponse = await response.json()

        const wikipediaRawContent = wikipediaRawResponse.query.pages

        Object.keys(wikipediaRawContent).forEach((key) => {
            content.sourceContentOriginal = wikipediaRawContent[key]['extract']
        })

    } catch (error) {
        console.log(error)
    }
  }

  function sanitizeContent(content) {
    const withoutBlankLinesAndMarkdown = removeBlankLinesAndMarkdown(content.sourceContentOriginal)
    const withoutDatesInParentheses = removeDatesInParentheses(withoutBlankLinesAndMarkdown)

    content.sourceContentSanitized = withoutDatesInParentheses

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

    const sentences = sentenceBoundaryDetection.sentences(content.sourceContentSanitized)
    sentences.forEach((sentence) => {
      content.sentences.push({
        text: sentence,
        keywords: [],
        images: []
      })
    })
  }

  function limitMaximumSentences(content) {
    content.sentences = content.sentences.slice(0, content.maximumSentences)
  }

  async function fetchKeywordsOfAllSentences(content) {
    for (const sentence of content.sentences) {
      sentence.keywords = await fetchWatsonAndReturnKeywords(sentence.text)
    }
  }

  async function fetchWatsonAndReturnKeywords(sentence) {
    return new Promise((resolve, reject) => {
      nlu.analyze({
        text: sentence,
        features: {
          keywords: {}
        }
      }, (error, response) => {
        if (error) {
          throw error
        }

        const keywords = response.keywords.map((keyword) => {
          return keyword.text
        })

        resolve(keywords)
      })
    })
  }

}

module.exports = robot
