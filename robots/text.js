const algorithmia = require('algorithmia')
const algorithmiaApiKey = require('../credentials/algorithmia.json').apiKey
const algorithmiaLang = require('../credentials/algorithmia.json').lang
const sentenceBoundaryDetection = require('sbd')

const watsonApiKey = require('../credentials/watson-nlu.json').apikey
const NaturalLanguageUnderstandingV1 = require('watson-developer-cloud/natural-language-understanding/v1.js')
 
const gotitaiApiKey = require('../credentials/gotitai.json').apiKey

const nlu = new NaturalLanguageUnderstandingV1({
  iam_apikey: watsonApiKey,
  version: '2018-04-05',
  url: 'https://gateway.watsonplatform.net/natural-language-understanding/api/'
})

const state = require('./state.js')

async function robot() {
  console.log('> [text-robot] Starting...')
  var content = state.load()
  await fetchContentFromWikipedia(content)
  sanitizeContent(content)
  breakContentIntoSentences(content)
  limitMaximumSentences(content)
  await fetchKeywordsOfAllSentences(content)
  await fetchGotItAi(content)
  state.save(content)

  async function fetchContentFromWikipedia(content) {
    console.log('> [text-robot] Fetching content from Wikipedia')
    const algorithmiaAuthenticated = algorithmia(algorithmiaApiKey)
    const wikipediaAlgorithm = algorithmiaAuthenticated.algo('web/WikipediaParser/0.1.2')
    var term = {
	    "articleName": content.searchTerm,
	    "lang": algorithmiaLang
    }
    const wikipediaResponse = await wikipediaAlgorithm.pipe(term)
    const wikipediaContent = wikipediaResponse.get()

    content.sourceContentOriginal = wikipediaContent.content
    console.log('> [text-robot] Fetching done!')
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

  async function fetchGotItAi(content) {
    var body =  {   'T': content.sourceContentOriginal, 'EM': true };
    const fetch = require("node-fetch")
    const url = "https://api.gotit.ai/NLU/v1.2/Analyze"
    console.log('> [text-robot] Getting feeling from GotIt.Ai')
    const getData = async url => {
    	try {
		const response = await fetch(url, {
			'method': 'post',
			'body':	JSON.stringify(body),
			'headers': {
			  'Content-Type': 'application/json',
			  'Authorization': `Basic ${gotitaiApiKey }`
	  		}	 
		})
		const json = await response.json()
		let arr = Object.values(json.emotions);
 		  let max = Math.max(...arr);
		  if(json.emotions.sadness == max) {
			  content.feeling = "sadness"
		  } else if(json.emotions.joy == max) {
			  content.feeling = "sadness"
		  } else if(json.emotions.fear == max) {
			  content.feeling = "sadness"
		  } else if(json.emotions.disgust == max) {
			  content.feeling = "sadness"
		  } else if(json.emotions.anger == max) {
			  content.feeling = "sadness"
		  } else {
			  content.feeling = "1"

		  }
		  console.log(`> [text-robot] the feeling is ${content.feeling}: by GotIt.Ai`)
	} catch (error) {
		console.log(`> [text-robot] ${error}`)
	}
    };
    await getData(url)
  }

  async function fetchKeywordsOfAllSentences(content) {
    console.log('> [text-robot] Starting to fetch keywords from Watson')
    for (const sentence of content.sentences) {
      console.log(`> [text-robot] Sentence: "${sentence.text}"`)

      sentence.keywords = await fetchWatsonAndReturnKeywords(sentence.text)

      console.log(`> [text-robot] Keywords: ${sentence.keywords.join(', ')}\n`)
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
          reject(error)
          return
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
