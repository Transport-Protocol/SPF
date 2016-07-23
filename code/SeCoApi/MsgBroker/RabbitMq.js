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

var connection;

RabbitMq.prototype.sendData = function(options,data,callback){
    if(!connection) {
        amqp.connect('amqp://localhost', function (err, conn) {
            if(!err){
                connection = conn;
                doRPC(callback);
            } else {
                return callback(err);
            }
        });
    } else {
        doRPC(callback);
    }
}

function doRPC(callback){
    connection.createChannel(function(err, ch) {
        if(err){
            return callback(err);
        }
        ch.assertQueue('', {exclusive: true}, function(err, q) {
            if(err){
                return callback(err);
            }
            var corr = generateUuid();
            var num = 10;
            var jsonMsg = {
                num: num,text: 'yolo'
            }
            console.log(' [x] Requesting fib(%d)', num);
            rabbitmqTimeout = setTimeout(function() {
                connection.close();
                winston.log('error','timeout for rabbitmq reached');
                process.exit(0)
            }, nconf.get('rpcTimeoutMS'));

            ch.consume(q.queue, function(msg) {
                if (msg.properties.correlationId == corr) {
                    clearTimeout(rabbitmqTimeout);
                    console.log(' [.] Got %s', msg.content.toString());
                    return callback(null,msg.content.toJSON());
                }
            }, {noAck: true});

            ch.sendToQueue('rpc_queue',
                new Buffer(JSON.stringify(jsonMsg)),
                { correlationId: corr, replyTo: q.queue,yolo:'yolo' });
        });
    });
}


function generateUuid() {
    return Math.random().toString() +
        Math.random().toString() +
        Math.random().toString();
}


module.exports = RabbitMq;









