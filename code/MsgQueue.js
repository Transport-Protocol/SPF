/**
 * Created by PhilippMac on 13.07.16.
 */
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




function MsgQueue(host){
    amqp.connect('amqp://localhost', function(err, conn) {
        if(!err){
            this._connection = conn;
        } else {
            throw err;
        }
    });
}


// class methods

MsgQueue.prototype.serverRpc = function (queueName) {
    return this._connection;
};



// export the class
module.exports = MsgQueue;