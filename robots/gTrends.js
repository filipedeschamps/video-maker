const Parser = require('rss-parser');
const unicode = require('unidecode');
const readline = require('readline-sync')

async function Gtrends(){

    const TREND_URL = 'https://trends.google.com/trends/trendingsearches/daily/rss?geo=BR' 
    return await askAndReturnTrend();
    
    /*
    *
    * Estou utilizando também a ideia do @danielschmitz onde o mesmo faz uma sugestão de assuntos a serem pesquisados por meio do Google Trends.
    * 
    * Alem de estar fazendo todas as validações de se foi inderido o valor ou não
    * 
    */


    async function getGoogleTrends () {
        const parser = new Parser();
        const trends = await parser.parseURL(TREND_URL);
        return trends
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

}

module.exports = Gtrends;