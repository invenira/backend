'use strict';


/**
 * Deploy the given activity id.
 * The AP should prepare itself to start collecting metrics for this activity id.
 *
 * body DeployActivityRequest 
 * id String Activity id
 * no response value expected for this operation
 **/
exports.deploy = function(body,id) {
  return new Promise(function(resolve, reject) {
    resolve();
  });
}


/**
 * Start collecting metrics for the provided activity id and student id. Return the Activity URL.
 * The AP should start collecting metrics for this activity id and student id combination. It should also return the deployUrl that will be forwarded by the Inven!RA platform to the student.
 *
 * id String Activity id
 * studentId String Inven!RA Student Id
 * returns ProvideActivityReply
 **/
exports.provideActivity = function(id,studentId) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = {
  "activityUrl" : "activityUrl"
};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}

