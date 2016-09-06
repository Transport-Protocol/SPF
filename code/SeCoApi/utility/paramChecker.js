/**
 * Created by phili on 18.07.2016.
 */

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
    if (!req.query.hasOwnProperty(paramater)) {
        sendError(res, paramater);
        contains = false;
    }
    return contains;
}

function sendError(res, missingParamater) {
    res.status(400).send('parameter: '.concat(missingParamater).concat(' is missing'));
}


module.exports = ParamChecker;