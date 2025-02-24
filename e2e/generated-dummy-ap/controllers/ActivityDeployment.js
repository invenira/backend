'use strict';

var utils = require('../utils/writer.js');
var ActivityDeployment = require('../service/ActivityDeploymentService');

module.exports.deploy = function deploy (req, res, next, body, id) {
  ActivityDeployment.deploy(body, id)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.provideActivity = function provideActivity (req, res, next, id, studentId) {
  ActivityDeployment.provideActivity(id, studentId)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};
