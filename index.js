const readline = require('readline-sync')
const Parser = require('rss-parser');
const unicode = require('unidecode');
const robots = {
  text: require('./robots/text.js'),
  wikipedia : require('./robots/wikipedia')
}

async function start(){
  const content = {}
  const TREND_URL = 'https://trends.google.com/trends/trendingsearches/daily/rss?geo=BR' 

  content.searchTerm = await askAndReturnSearchTerm()
  content.prefix = askAndReturnPrefix()
  await robots.wikipedia(content)
  await robots.text(content)
  console.log('To the next step...')
  console.log('Exiting Program...')


  /*
  *
  * Estou utilizando também a ideia do @danielschmitz onde o mesmo faz uma sugestão de assuntos a serem pesquisados por meio do Google Trends.
  * 
  * Alem de estar fazendo todas as validações de se foi inderido o valor ou não
  * 
  */
  async function askAndReturnSearchTerm () {
      const response = readline.question('Type a Wikipedia search term or G to fetch google trends: ')
  
      var value = (response.toUpperCase() === 'G') ?  await askAndReturnTrend() : response
      if(!value){
        console.log('You don\'t defined any search term...')
        console.log('Exiting Program...')
        process.exit()
      }
      return value
  
  }
  /*
  *
  * Estou utilizando o package unicode, para assim solucionar o problema do KeyInSelect do readline-sync de não imprimir UTF-8 .
  * 
  */
  async function askAndReturnTrend() {
      console.log('Please Wait...')
      var trends = await getGoogleTrends()
      const trendsB = trends.items.map(i => i.title.toString('utf8'))
      trends = trends.items.map(i => unicode(i.title.toString('utf8')))
      const choice = readline.keyInSelect(trends, 'Choose your trend:')
  
      return trendsB[choice] 
  }
  
  async function getGoogleTrends () {
      const parser = new Parser();
      const trends = await parser.parseURL(TREND_URL);
      return trends
  }
  
  function askAndReturnPrefix(){
      const prefix = ['Who is','What is','The history of']
      const selectedPrefixIndex = readline.keyInSelect(prefix,'Choose an option for \''+unicode(content.searchTerm)+' \':')
      const selectedPrefixText = prefix[selectedPrefixIndex]
      if(!selectedPrefixText){
        console.log('You don\'t defined a option for your term...')
        console.log('Exiting Program...')
        process.exit()
      }
      return selectedPrefixText
  }
 


}

start()