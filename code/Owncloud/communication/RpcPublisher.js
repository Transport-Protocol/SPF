/**
 * Created by phili on 01.08.2016.
 */
var winston = require('winston');
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