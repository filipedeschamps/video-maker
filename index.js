const readline = require('readline-sync')
const Parser = require('rss-parser');
const unicode = require('unidecode');
const robots = {
  text: require('./robots/text.js'),
  gTrends: require('./robots/gTrends'),
  wikipedia : require('./robots/wikipedia')
}

async function start(){
  const content = {} 

  /*
  * Estou modificando um pouco a sugestão de estrutura do Content, pela API da propria Wikipedia,
  * temos varios outros dados muito valiosos, como imagens e até mesmo fonte dessas informações,
  * o que acaba sendo muito util para futuras implementações, ser descartado isso e ser utilizado apenas a propriedade content.
  * Obviamente, caso realmente deseje utilizar apenas a propriedade content, 
  * podemos extrair apenas a propriedade extracts (Na função getContent, do robo da Wikipedia, excluindo as outras propriedades)
  * retornando apenas o texto, e deixando o retorno mais rapida.
  */
  content.searchTerm = await askAndReturnSearchTerm()
  content.prefix = askAndReturnPrefix()
  content.wikiPediaContent = await robots.wikipedia(content)
  await robots.text(content)
  console.log('To the next step...')
  console.log('Exiting Program...')

  async function askAndReturnSearchTerm () {
      const response = readline.question('Type a Wikipedia search term or G to fetch google trends: ')
      /*
      * Seguindo sugestão do @HiltonWS estou modulando o Google Trends, assim tendo a possibilidade de 
      * utilizar outros trends ou outras fontes de sugestões, apenas modificando o texto acima de questão
      * e modificando a função/robo utilizado
      */
      var value = (response.toUpperCase() === 'G') ?  await robots.gTrends() : response
      if(!value){
        console.log('You don\'t defined any search term...')
        console.log('Exiting Program...')
        process.exit()
      }
      return value
  
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