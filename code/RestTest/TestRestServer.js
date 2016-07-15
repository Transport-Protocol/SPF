/**
 * Created by PhilippMac on 13.07.16.
 */
// call the packages we need
var express    = require('express');        // call express
var fileUpload = require('express-fileupload');
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');

// configure app to use bodyParser()
// this will let us get the data from a POST
//app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
//reading multipart fileupload
app.use(fileUpload());

var port = process.env.PORT || 8080;        // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

// middleware to use for all requests
router.use(function(req, res, next) {
    // do logging
    console.log('Something is happening.');
    next(); // make sure we go to the next routes and don't stop here
});

router.route('/dropbox')
    .get(function(req,res) {
       console.log(req.query.file);
       res.json({message: 'Dropbox get route'});
    });

router.route('/dropbox')
    .put(function(req,res) {
        var file;

        if (!req.files) {
            res.send('No files were uploaded.');
            return;
        }
        //file in form data request has to be named as sampleFile
        file = req.files.file;
        //data buffer inside req.files.file.data
            if (!file) {
                res.status(500).send('error - wrong form-data name');
            }
            else {
                res.send('File uploaded!');
            }
    });

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
    res.json({ message: 'hooray! welcome to our api!' });
});

// more routes for our API will happen here

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);