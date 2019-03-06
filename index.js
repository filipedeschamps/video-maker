const readline = require('readline-sync')
const googleTrends = require('google-trends-api');
const math = require('mathjs')
const robots = {
  text: require('./robots/text.js')
}

async function start() {
  const content = {}

  content.searchTerm = askAndReturnSearchTerm()
  content.prefix = await getPrexifTrends(content.searchTerm)

  console.log(content)

  await robots.text(content)

  function askAndReturnSearchTerm() {
    return readline.question('Type a Wikipedia search term: ')
  }

  async function getPrexifTrends(searchTerm) {
    const prefixes = ['Who is', 'What is', 'The history of']
    let prefixesTrend = []
    let mostTrend;
    prefixes.forEach((elem) => {
      prefixesTrend.push(elem + ' ' + searchTerm);
    });

    return googleTrends.interestOverTime({ keyword: prefixesTrend }).then((results) => {
      let data = JSON.parse(results);
      let values = [];
      data.default.timelineData.forEach((elem) => {
        values.push(elem.value);
      });

      let mostTrends = [];
      math.transpose(values).forEach((elem) => {
        mostTrends.push(math.sum(elem));
      });

      return prefixes[mostTrends.indexOf(math.max(mostTrends))];
    }).catch((err) => {
      console.error('Oh no there was an error', err);
      return prefixes[Math.random() * prefixes.length];
    });
  }

  console.log(content)
}

start()
