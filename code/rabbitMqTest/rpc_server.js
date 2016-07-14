/**
 * Created by phili on 11.07.2016.
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

function fibonacci(n) {
    if (n == 0 || n == 1)
        return n;
    else
        return fibonacci(n - 1) + fibonacci(n - 2);
}