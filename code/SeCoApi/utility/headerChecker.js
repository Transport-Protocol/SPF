/**
 * Created by PhilippMac on 19.07.16.
 */
/**
 * Created by phili on 18.07.2016.
 */
var error = require('../errorCodes');

function HeaderChecker(params){
    this.params = params;
}

HeaderChecker.prototype.checkParams = function ( req,res){
    var allParamsOk = true;
    for(var i = 0;i<this.params.length;i++){
        if(!checkParameter(req,res,this.params[i])){
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