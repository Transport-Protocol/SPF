/**
 * Created by phili on 11.07.2016.
 */
var amqp = require('amqplib/callback_api');

amqp.connect('amqp://localhost:5673', function(err, conn) {
    if(err){
        console.log('rabbitmq _server not reachable');
    } else {
        conn.createChannel(function (err, ch) {
            var q = 'hello';

            ch.assertQueue(q, {durable: false});
            console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", q);
            ch.consume(q, function (msg) {
                console.log(" [x] Received %s", msg.content.toString());
            }, {noAck: true});
        });
    }
});