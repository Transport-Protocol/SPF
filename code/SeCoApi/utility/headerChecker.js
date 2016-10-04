/**
 * Created by PhilippMac on 19.07.16.
 */

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
    res.status(400).send('header parameter: '.concat(missingParamater).concat(' is missing'));
}


module.exports = HeaderChecker;