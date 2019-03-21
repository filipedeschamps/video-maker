const fs = require('fs')
const contentFilePath = './content.json'

function save(content) {
  const contentString = JSON.stringify(content)
  return fs.writeFileSync(contentFilePath, contentString)
}

function load() {
  const fileBuffer = fs.readFileSync(contentFilePath, 'utf-8')
  const contentJson = JSON.parse(fileBuffer)
  return contentJson
}

module.exports = {
  save,
  load
}
