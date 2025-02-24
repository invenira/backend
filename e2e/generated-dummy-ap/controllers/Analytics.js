'use strict';

var utils = require('../utils/writer.js');
var Analytics = require('../service/AnalyticsService');

module.exports.getAnalyticsContract = function getAnalyticsContract (req, res, next) {
  Analytics.getAnalyticsContract()
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.provideAnalytics = function provideAnalytics (req, res, next, id) {
  Analytics.provideAnalytics(id)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};
