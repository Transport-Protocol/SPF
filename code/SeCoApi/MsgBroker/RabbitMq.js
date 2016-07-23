/**
 * Created by PhilippMac on 21.07.16.
 * Class can be seen as a Implementation of MsgBroker
 */
var util = require('util');
var winston = require('winston');
var amqp = require('amqplib/callback_api');
var nconf = require('nconf');

function RabbitMq(){
}

var channel;
var callbackQueue = 'callbackQueue';

RabbitMq.prototype.sendData = function(options,data,callback){
    if(!channel) {
        amqp.connect('amqp://localhost', function (err, conn) {
            if(!err){
                conn.createChannel(function(err,ch){
                   if(err){
                       return callback(err);
                   }
                   channel = ch;
                    channel.assertQueue(callbackQueue,{exclusive:true});
                    listenOnCallbackQueue();
                    doRPC(callback);
                });
            } else {
                return callback(err);
            }
        });
    } else {
        doRPC(callback);
    }
}

function listenOnCallbackQueue(){
    channel.consume(callbackQueue,function(msg){
       channel.emit(msg.properties.correlationId,msg);
    }, {noAck: true});
}

function doRPC(callback){
            var corr = generateUuid();
            var num = 10;
            var jsonMsg = {
                num: num,text: 'yolo'
            }
            console.log(' [x] Requesting fib(%d)', num);
            rabbitmqTimeout = setTimeout(function() {
                channel.connection.close();
                winston.log('error','timeout for rabbitmq reached');
                process.exit(0)
            }, nconf.get('rpcTimeoutMS'));

            channel.sendToQueue('rpc_queue',
                new Buffer(JSON.stringify(jsonMsg)),
                { correlationId: corr, replyTo: callbackQueue});

            channel.on(corr,function(msg){
                clearTimeout(rabbitmqTimeout);
                var res = msg.content.toString();
                console.log(' [.] Got %s', res);
                return callback(null,res);
            });
}


function generateUuid() {
    return Math.random().toString() +
        Math.random().toString() +
        Math.random().toString();
}


module.exports = RabbitMq;









