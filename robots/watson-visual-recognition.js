const watsonClassifierApiKey = require('../credentials/watson-classifier.json').apiKey

async function robot(imagePath) {
  return await classifyImage(imagePath)

  async function classifyImage(imagePath) {
    return "A";
  }
  
}

module.exports = robot
