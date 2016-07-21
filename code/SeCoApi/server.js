/**
 * Created by phili on 18.07.2016.
 */
//npm modules
var express = require('express');
var fileUpload = require('express-fileupload');
var bodyParser = require('body-parser');
var winston = require('winston');

//my modules
var dropbox = require('./routes/dropbox');
var owncloud = require('./routes/owncloud');
var github = require('./routes/github');
var googleDrive = require('./routes/googleDrive');
var bitbucket = require('./routes/bitbucket');
var slack = require('./routes/slack');
var msgBrokerType = require('./msgBroker/msgBrokerType');
var MsgBroker = require('./msgBroker/msgBroker');

process.env.LOG_LEVEL = 'info';
winston.level = process.env.LOG_LEVEL;

var app = express();
app.use(bodyParser.json());
//reading multipart fileupload
app.use(fileUpload());

var port = process.env.PORT || 8080;

var router = express.Router();

// middleware to use for all requests
app.use(function (req, res, next) {
    // do logging
    winston.log('info','***new request***');
    next(); // make sure we go to the next routes and don't stop here
});


// REGISTER ROUTES -------------------------------
app.use('/api', router);
app.use('/api/dropbox',dropbox);
app.use('/api/owncloud',owncloud);
app.use('/api/googledrive',googleDrive);
app.use('/api/github',github);
app.use('/api/bitbucket',bitbucket);
app.use('/api/slack',slack);


var broker = new MsgBroker(msgBrokerType.RABBITMQ);
broker.sendData(null,null,function(err,data){

});

// START THE SERVER
// =============================================================================
app.listen(port);
winston.log('info','Api created at port: ',port);