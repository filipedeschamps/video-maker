const googleTrends = require('google-trends-api');

module.exports = {
  searchHotTrends: function (count) {
    const trendsSettings = {
      trendDate: new Date(),
      geo: 'BR',
      hl: "pt-BR"
    };

    return googleTrends.realTimeTrends(trendsSettings)
      .then(JSON.parse)
      .then(parsedResult => parsedResult.storySummaries.trendingStories)
      .then(hotTrendStories => hotTrendStories.map(story => story['entityNames']))
      .then(hotTrends => [].concat.apply([], hotTrends).slice(0, count))
      .catch(error => {
        console.error('An error occurs: ', error);
        return [];
      });
  }
};
