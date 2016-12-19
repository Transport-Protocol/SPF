/**
 * Created by PhilippMac on 19.07.16.
 */
var RpcJsonResponseBuilder = require('./rpcJsonResponseBuilder');

function HeaderChecker(){
}

HeaderChecker.prototype.containsParameter = function (params, req, res){
    if(params === undefined){
        return true;
    }
    var allParamsOk = true;
    for(var i = 0;i<params.length;i++){
        if(!checkParameter(req,res,params[i])){
            allParamsOk = false;
            break;
        }
    }
    return allParamsOk;
};

function checkParameter(req, res, paramater) {
    var contains = true;
    if (!req.headers.hasOwnProperty(paramater)) {
        sendError(res, paramater);
        contains = false;
    }
    return contains;
}

function sendError(res, missingParamater) {
    var result = RpcJsonResponseBuilder.buildError('Header parameter "' + missingParamater + '" is missing');
    return res.json(result);
}


module.exports = HeaderChecker;