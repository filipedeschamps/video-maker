const sentenceBoundaryDetection = require("sbd");
const language = require("@google-cloud/language");
const projectId = "video-maker008";
const keyFilename = "./video-maker008-7fdf9c41c6e7.json";
const state = require('./state.js');

async function Text() {
  const content = state.load();
  sanitizeContent(content);
  breakContentIntoSentences(content);
  limitMaximumSentences(content);
  await featchKeywordsOfAllSentences(content);
  console.log("Build Sentences");

  state.save(content);

  function sanitizeContent(content) {
    const withoutBlankLinesAndMarkdown = removeBlankLinesAndMarkdown(
      content.wikiPediaContent.content
    );
    const withoutDatesInParentheses = removeDatesInParentheses(
      withoutBlankLinesAndMarkdown
    );

    content.wikiPediaContent.sourceContentSanitized = withoutDatesInParentheses;

    function removeBlankLinesAndMarkdown(text) {
      const allLines = text.split("\n");

      const withoutBlankLinesAndMarkdown = allLines.filter((line) => {
        if (line.trim().length === 0 || line.trim().startsWith("=")) {
          return false;
        }

        return true;
      });

      return withoutBlankLinesAndMarkdown.join(" ");
    }
  }

  function removeDatesInParentheses(text) {
    return text.replace(/\((?:\([^()]*\)|[^()])*\)/gm, "").replace(/  /g, " ");
  }

  function breakContentIntoSentences(content) {
    content.sentences = [];

    const sentences = sentenceBoundaryDetection.sentences(
      content.wikiPediaContent.sourceContentSanitized
    );
    sentences.forEach((sentence) => {
      content.sentences.push({
        text: sentence,
        keywords: [],
        images: [],
      });
    });
  }

  function limitMaximumSentences(content) {
    content.sentences = content.sentences.slice(0, content.maximumSentences);
  }

  async function featchKeywordsOfAllSentences(content) {
    for (const sentence of content.sentences) {
      sentence.keywords = await feathGoogleLanguageAndReturnKeywords(
        sentence.text
      );
    }
  }
  async function feathGoogleLanguageAndReturnKeywords(sentence) {
    return new Promise((resolve, reject) => {
      const client = new language.LanguageServiceClient();

      const document = {
        content: sentence,
        type: "PLAIN_TEXT",
        language: "pt"
      };

      client.analyzeEntities({ document }, (error, response) => {
        if (error) {
          reject(error);
          return;
        }

        const keywords = response.entities.map((entitie) => {
          return entitie.name;
        });

        resolve(keywords);
      });
    });
  }
}

module.exports = Text;
