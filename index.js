const prompts = require('prompts')
const robots = {
  text: require('./robots/text.js')
}
const trends = require('./searchHotTrends');

async function askAndReturnAnswers() {
  const questions = [
    {
      type: 'select',
      name: 'searchTerm',
      message: 'Choose one search term:',
      choices: await trends.searchHotTrends(count=9),
      validate: value => typeof value === 'string' ? value.trim() !== '' : false,
    },
    {
      type: 'select',
      name: 'prefix',
      message: 'Choose one option:',
      choices: ['Who is', 'What is', 'The history of'],
      validate: value => typeof value === 'string' ? value.trim() !== '' : false,
    }
  ];

  return new Promise(async (resolve, reject) => {
    const promptOptions = {
      onCancel: () => reject(new Error('The user has stopped answering'))
    }
    const response = await prompts(questions, promptOptions)
    resolve(response)
  });
}

async function start() {
  const content = await askAndReturnAnswers()

  await robots.text(content)

  console.log(content);
}

start();
