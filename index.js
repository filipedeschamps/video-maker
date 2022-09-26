require("dotenv");
const readline = require("readline-sync");
const Parser = require("rss-parser");
const unicode = require("unidecode");
const state = require("./robots/state.js");
const robots = {
  text: require("./robots/text.js"),
  gTrends: require("./robots/gTrends"),
  wikipedia: require("./robots/wikipedia"),
  image: require("./robots/image"),
  video: require("./robots/video") 
};

async function start() {
  const content = state.load();  

  content.searchTerm = await askAndReturnSearchTerm();
  content.prefix = askAndReturnPrefix();
  content.wikiPediaContent = await robots.wikipedia(content);

  state.save(content);

  await robots.text();
  await robots.image();
  await robots.video();

  console.log("To the next step...");
  console.log("Exiting Program...");

  async function askAndReturnSearchTerm() {
    const response = readline.question(
      "Type a Wikipedia search term or G to fetch google trends: "
    );
    var value =
      response.toUpperCase() === "G" ? await robots.gTrends() : response;
    if (!value) {
      console.log("You don't defined any search term...");
      console.log("Exiting Program...");
      process.exit();
    }
    return value;
  }

  function askAndReturnPrefix() {
    const prefix = ["Who is", "What is", "The history of"];
    const selectedPrefixIndex = readline.keyInSelect(
      prefix,
      "Choose an option for '" + unicode(content.searchTerm) + " ':"
    );
    const selectedPrefixText = prefix[selectedPrefixIndex];
    if (!selectedPrefixText) {
      console.log("You don't defined a option for your term...");
      console.log("Exiting Program...");
      process.exit();
    }
    return selectedPrefixText;
  }
  //console.log(JSON.stringify(content, null, 4));
}

start();
