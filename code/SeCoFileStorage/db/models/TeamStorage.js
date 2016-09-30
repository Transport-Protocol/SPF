/**
 * Created by PhilippMac on 29.09.16.
 */
// Load mongoose package
var mongoose = require('mongoose');


// Create a schema
var FileStorageSchema = new mongoose.Schema({
    seCoFilePath: {type: String, required: true},
    serviceFilePath: {type: String, required: true},
    fileName: {type: String, required: true},
    username: {type: String, required: true},
    serviceName: {type: String, required: true}
});

// Create a schema
var TeamStorageSchema = new mongoose.Schema({
    teamName: {type: String, required: true},
    files:[FileStorageSchema]
});

module.exports = mongoose.model('TeamStorage', TeamStorageSchema);