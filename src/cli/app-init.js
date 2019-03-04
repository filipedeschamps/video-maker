import readline from 'readline-sync'

// askAndReturnSearchTerm() -> getSearchTerm(): it ignores how it will get the search term (ignora como ele obterá o termo de pesquisa)
const getSearchTerm = () => {
  const source = "Wikipedia";
  return readline.question(`Type ${source} search term: `);
}

const getPrefixes = () => {
  return ['Who is', 'What is', 'The history of'];
}

const getPrefix = () => {
  const prefixes = getPrefixes()
  const msg = "Choose what the video is about: "
  const selectedPrefixIndex = readline.keyInSelect(prefixes, msg)
  return prefixes[selectedPrefixIndex]
}

export const requireDataForRobot = () => {
  const content = {
    searchTerm: getSearchTerm(),
    prefix: getPrefix()
  }

  return content;
}