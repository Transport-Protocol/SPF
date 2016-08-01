/**
 * Created by PhilippMac on 25.07.16.
 */
var connector = require('./owncloud');

connector.getFileTree('BA-Philipp',function(err,dirs){
    if(!err) {
        console.log(dirs);
    } else {
        console.log(err);
    }
});

connector.getFile('BA-Philipp/Umfrage/Umfrage.pdf',function(err,fileName,buffer){
    if(!err) {
        console.log('%s retrieved; buffer: %s', fileName,buffer);
    } else {
        console.log(err);
    }
});



var amqp = require('amqplib/callback_api');

amqp.connect('amqp://localhost', function(err, conn) {
    conn.createChannel(function(err, ch) {
        var q = 'rpc_queue';

        ch.assertQueue(q, {durable: false});
        ch.prefetch(1);
        console.log(' [x] Awaiting RPC requests');
        ch.consume(q, function reply(msg) {
            var jsonContent = JSON.parse(msg.content);
            var n = parseInt(jsonContent.num);

            console.log(" [.] fib(%d)", n);
            var r = fibonacci(n);

            ch.sendToQueue(msg.properties.replyTo,
                new Buffer(r.toString()),
                {correlationId: msg.properties.correlationId});

            ch.ack(msg);
        });
    });
});

