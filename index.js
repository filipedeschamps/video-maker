const readline = require('readline-sync')
const webdriver = require('selenium-webdriver');

const By = webdriver.By
const until = webdriver.until
const driver = new webdriver.Builder()
  .forBrowser('chrome') // http://chromedriver.chromium.org/downloads
  .build()

async function start() {
  asyncForEach(await selectNextTrend(), trend => {
    questions(trend)
  })
}

function questions(searchTerm) {
  const content = {}

  // content.searchTerm = askAndReturnSearchTerm()
  content.searchTerm = searchTerm
  content.prefix = askAndReturnPrefix(searchTerm)

  function askAndReturnSearchTerm() {
    return readline.question('Type a Wikipedia search term: ')
  }

  function askAndReturnPrefix(searchTerm) {
    const prefixes = ['Who is', 'What is', 'The history of']
    const selectedPrefixIndex = readline.keyInSelect(prefixes, `Choose an option for ${searchTerm}: `)
    const selectedPrefixText = prefixes[selectedPrefixIndex]

    return selectedPrefixText
  }

  console.log(content)
}


const asyncForEach = async (array, callback) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

/**
 * Função para buscar uma nova tendencia no google
 */
const selectNextTrend = async () => {
  let searchTerm = []

  // Pesquisas em Alta
  await driver.get('https://trends.google.com/trends/trendingsearches/daily?geo=BR')
  // xpath: //tagname[@attribute='value']
  const list = await driver.findElement(By.xpath("//md-list[@class='md-list-block']"))
  const details = await list.findElements(By.xpath("//div[@class='details']/div[@class='details-top']"))
  await asyncForEach(details, async title => {
    searchTerm.push(await title.getText())
  })
  await driver.close()
  return searchTerm
}

start()
