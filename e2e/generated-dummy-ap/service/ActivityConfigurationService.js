'use strict';


/**
 * Get the AP Activity Configuration Interface URL
 *
 * returns ConfigInterfaceResponse
 **/
exports.getConfigInterface = function () {
    return new Promise(function (resolve, reject) {
        var examples = {};
        examples['application/json'] = {
            "interfaceUrl": "interfaceUrl"
        };
        if (Object.keys(examples).length > 0) {
            resolve(examples[Object.keys(examples)[0]]);
        } else {
            resolve();
        }
    });
}


/**
 * Get the AP Activity Configuration Parameters
 *
 * returns ConfigParametersResponse
 **/
exports.getConfigParameters = function () {
    return new Promise(function (resolve, reject) {
        var examples = {};
        examples['application/json'] = [{
            "name": "test",
            "type": "string"
        }];
        if (Object.keys(examples).length > 0) {
            resolve(examples[Object.keys(examples)[0]]);
        } else {
            resolve();
        }
    });
}

