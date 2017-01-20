/**
 * Created by phili on 18.07.2016.
 */
var RpcJsonResponseBuilder = require('./rpcJsonResponseBuilder');

function ParamChecker(){
}

ParamChecker.prototype.containsParameter = function (params, req, res){
    var allParamsOk = true;
    //if params empty no params required
    if(!params){
        return allParamsOk;
    }
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
    if (!req.query.hasOwnProperty(paramater) && !req.params.hasOwnProperty(paramater)) {
        sendError(res, paramater);
        contains = false;
    }
    return contains;
}

function sendError(res, missingParamater) {
    var result = RpcJsonResponseBuilder.buildError('parameter "' + missingParamater + '" is missing');
    return res.json(result);
}


module.exports = ParamChecker;