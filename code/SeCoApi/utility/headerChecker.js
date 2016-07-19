/**
 * Created by PhilippMac on 19.07.16.
 */
/**
 * Created by phili on 18.07.2016.
 */
var error = require('../errorCodes');

function HeaderChecker(){
}

HeaderChecker.prototype.containsParameter = function (params, req, res){
    var allParamsOk = true;
    for(var i = 0;i<params.length;i++){
        if(!checkParameter(req,res,params[i])){
            allParamsOk = false;
            break;
        }
    }
    return allParamsOk;
}

function checkParameter(req, res, paramater) {
    var contains = true;
    if (!req.headers.hasOwnProperty(paramater)) {
        sendError(req, res, paramater);
        contains = false;
    }
    return contains;
}

function sendError(req, res, missingParamater) {
    res.send({
        route: req.baseUrl,
        error: error.missingHeaderParameter,
        errorMessage: 'header parameter: '.concat(missingParamater).concat(' is missing')
    });
}


module.exports = HeaderChecker;