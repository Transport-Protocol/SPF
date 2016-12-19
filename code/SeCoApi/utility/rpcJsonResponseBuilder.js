/**
 * Created by PhilippMac on 28.11.16.
 */
"use strict";

function buildError(errMsg) {
    return {
        "ok": false,
        "errorMsg": errMsg
    };
}

function buildParams(params, values) {
    var response = {
        "ok": true
    };
    for (var i = 0; i < params.length; i++) {
        response[params[i]] = values[i];
    }
    return response;
}

module.exports = {
    buildError: buildError,
    buildParams: buildParams
};
