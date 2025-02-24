'use strict';


/**
 * Get the AP provided analytics contract
 *
 * returns AnalyticsContractResponse
 **/
exports.getAnalyticsContract = function() {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = {
  "qualAnalytics" : [ {
    "name" : "name",
    "type" : "string"
  }, {
    "name" : "name",
    "type" : "string"
  } ],
  "quantAnalytics" : [ {
    "name" : "name",
    "type" : "string"
  }, {
    "name" : "name",
    "type" : "string"
  } ]
};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * Get the AP provided analytics for the given activity Id
 *
 * id String 
 * returns AnalyticsResponse
 **/
exports.provideAnalytics = function(id) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = [ {
  "inveniraStudentId" : "inveniraStudentId",
  "qualAnalytics" : [ {
    "name" : "name",
    "type" : "string",
    "value" : { }
  }, {
    "name" : "name",
    "type" : "string",
    "value" : { }
  } ],
  "quantAnalytics" : [ null, null ]
}, {
  "inveniraStudentId" : "inveniraStudentId",
  "qualAnalytics" : [ {
    "name" : "name",
    "type" : "string",
    "value" : { }
  }, {
    "name" : "name",
    "type" : "string",
    "value" : { }
  } ],
  "quantAnalytics" : [ null, null ]
} ];
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}

