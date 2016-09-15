/**
 * Created by PhilippMac on 21.07.16.
 * Class serves as "interface" to be able to use different network communication
 * for possible future changes
 */
var winston = require('winston');
var RabbitMq = require('./rabbitMq');
    nconf = require('nconf');

function MsgBroker(msgBrokerType,serverIp,serverPort){
    this.msgBrokerType = msgBrokerType;

    switch(this.msgBrokerType){
        case msgBrokerType.RABBITMQ:
            this.implementation = new RabbitMq(serverIp,serverPort);
            break;
        default:
            this.implementation = new RabbitMq(serverIp,serverPort);
    }

}

MsgBroker.prototype.sendData = function (sendOptions,data,callback){
    if(!typeof this.implementation.sendData == 'function') {
        winston.log('error', 'sendData not implemented by super class');
        return callback(null, null);
    } else {
        this.implementation.sendData(sendOptions,data,callback);
    }
};

MsgBroker.prototype.getFile = function (options,path,auth,callback){
    if(!typeof this.implementation.getFile == 'function') {
        winston.log('error', 'getFile not implemented by super class');
        return callback(null, null);
    } else {
        this.implementation.getFile(options.queueName,path,auth,callback);
    }
};


module.exports = MsgBroker;

