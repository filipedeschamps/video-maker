const watsonClassifierApiKey = require('../credentials/watson-classifier.json').apiKey
const fs = require('fs')
const requestPromise = require('request-promise')

async function robot(imagePath) {
  return await classifyImage(imagePath)

  async function classifyImage(imagePath) {
    const identifiedClasses = await requestWatson(imagePath)
    return identifiedClasses.images[0].classifiers[0].classes[0].class
  }

  async function requestWatson(imagePath) {
    const headers = {
      'Authorization': 'Basic ' + new Buffer.from("apiKey:" + watsonClassifierApiKey).toString('base64') 
    }

    const promise = requestPromise.post({headers: headers, 
      url: 'https://gateway.watsonplatform.net/visual-recognition/api/v3/classify?version=2018-03-19',
      transform: JSON.parse})      
    
    promise.form().append('images_file', fs.createReadStream(imagePath))

    return promise
  }
  
  
}

module.exports = robot
