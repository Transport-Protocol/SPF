/**
 * Created by PhilippMac on 24.08.16.
 */
// Load mongoose package
var mongoose = require('mongoose');

// Create a schema
var NotificationSchema = new mongoose.Schema({
    username: {type: String, required: true},
    teamName: {type: String, required: true},
    message: {type: String, required: true},
    service: {type: String, required: true}
}, {
    timestamps: true
});

module.exports = mongoose.model('Notification', NotificationSchema);