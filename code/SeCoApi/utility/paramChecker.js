/**
 * Created by phili on 18.07.2016.
 */
var error = require('../errorCodes');

function ParamChecker(){
}

ParamChecker.prototype.containsParameter = function (params, req, res){
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
    if (!req.query.hasOwnProperty(paramater)) {
        sendError(req, res, paramater);
        contains = false;
    }
    return contains;
}

function sendError(req, res, missingParamater) {
    res.send({
        route: req.baseUrl,
        error: error.missingParamater,
        errorMessage: 'parameter: '.concat(missingParamater).concat(' is missing')
    });
}


module.exports = ParamChecker;