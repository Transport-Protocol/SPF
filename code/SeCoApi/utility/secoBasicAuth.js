/**
 * Created by PhilippMac on 28.09.16.
 */
var auth = require('basic-auth'),
    grpc = require('grpc'),
    nconf = require('nconf'),
    winston = require('winston');




function verifyBasicAuth(req,callback){
    var user = auth(req);
    if(typeof user === 'undefined'){
        return callback(new Error('invalid or missing basic authentication'));
    }
    winston.log('info','username: %s password: %s',user.name,user.pass);
    var url = nconf.get('userServiceIp') + ':' + nconf.get('userServicePort');
    winston.log('info', 'grpc url: %s', url);
    var proto = grpc.load('./proto/userManagement.proto').userManagement;
    var client = new proto.UserManagement(url,
        grpc.credentials.createInsecure());
    client.isLoginCorrect({
        name: user.name,
        password: user.pass
    }, function (err, response) {
        if (err) {
            return callback(new Error('userservice offline'));
        } else {
            if (response.err) {
                winston.log('error', 'couldnt check seco authentication',response.err);
                return callback(response.err);
            } else {
                winston.log('info', 'successfully checked seco authentication. isMatch: ', response.isCorrect);
                return callback(null,response.isCorrect,user.name);
            }
        }
    });
}

module.exports = {
    verifyBasicAuth : verifyBasicAuth
};