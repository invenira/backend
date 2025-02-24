'use strict';

var utils = require('../utils/writer.js');
var ActivityConfiguration = require('../service/ActivityConfigurationService');

module.exports.getConfigInterface = function getConfigInterface (req, res, next) {
  ActivityConfiguration.getConfigInterface()
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.getConfigParameters = function getConfigParameters (req, res, next) {
  ActivityConfiguration.getConfigParameters()
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};
