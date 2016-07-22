/**
 * Created by PhilippMac on 21.07.16.
 * Class can be seen as a Implementation of MsgBroker
 */
var util = require('util');
var winston = require('winston');
var amqp = require('amqplib/callback_api');

function RabbitMq(){
}

var connection;

RabbitMq.prototype.sendData = function(options,data,callback){
    if(!connection) {
        amqp.connect('amqp://localhost', function (err, conn) {
            if(!err){
                connection = conn;
                doRPC(function(err,msg){
                    if(!err){
                        callback(null,msg);
                    } else {
                        callback(err,null);
                    }
                });
            } else {
                return callback(err,null);
            }
        });
    } else {
        doRPC(function(err,msg){
            if(!err){
                callback(null,msg);
            } else {
                callback(err,null);
            }
        });
    }
}

function doRPC(callback){
    connection.createChannel(function(err, ch) {
        ch.assertQueue('', {exclusive: true}, function(err, q) {
            var corr = generateUuid();
            var num = 10;
            var jsonMsg = {
                num: num,text: 'yolo'
            }
            console.log(' [x] Requesting fib(%d)', num);

            ch.consume(q.queue, function(msg) {
                if (msg.properties.correlationId == corr) {
                    console.log(' [.] Got %s', msg.content.toString());
                    return callback(null,msg.content.toJSON());
                    setTimeout(function() { conn.close(); process.exit(0) }, 500);
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









