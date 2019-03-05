const googleTrends = require('google-trends-api');

module.exports = {
  searchHotTrends: function () {
    let trendsSettings = {
      trendDate: new Date(),
      geo: 'BR',
      hl: "pt-BR"
    };

    return googleTrends.realTimeTrends(trendsSettings)
      .then(results => {
        let hotTrendStories = JSON.parse(results)['storySummaries']['trendingStories'];
        let hotTrends = [];
        hotTrendStories.forEach((story) => hotTrends = hotTrends.concat(story['entityNames']));
        return hotTrends.slice(0, 9);
      })
      .catch(error => {
        console.error('An error occurs: ', error);
        return [];
      });
  }
};