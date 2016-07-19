/**
 * Created by phili on 18.07.2016.
 */

var express = require('express');
var fileUpload = require('express-fileupload');
var bodyParser = require('body-parser');
var dropbox = require('./routes/dropbox');
var owncloud = require('./routes/owncloud');
var github = require('./routes/github');
var googleDrive = require('./routes/googleDrive');
var bitbucket = require('./routes/bitbucket');
var slack = require('./routes/slack');


var app = express();
app.use(bodyParser.json());
//reading multipart fileupload
app.use(fileUpload());

var port = process.env.PORT || 8080;

var router = express.Router();

// middleware to use for all requests
app.use(function (req, res, next) {
    // do logging
    console.log('***new request***');
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



// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Api created at port ' + port);