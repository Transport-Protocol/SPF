/**
 * Created by PhilippMac on 24.08.16.
 */
// Load mongoose package
var mongoose = require('mongoose'),
    bcrypt = require('bcrypt'),
    SALT_WORK_FACTOR = 10;

// Create a schema
var TeamSchema = new mongoose.Schema({
    teamName: {type: String, required: true, index: {unique: true}},
    password: {type: String, required: true},
    teamCreator: {type: String, required: true},
    members: {type: Array},
    services: {type: Array} // JSON String with service name
});

TeamSchema.pre('save', function (next) {
    var team = this;

    // only hash the password if it has been modified (or is new)
    if (!team.isModified('password')) return next();

    // generate a salt
    bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
        if (err) return next(err);

        // hash the password using our new salt
        bcrypt.hash(team.password, salt, function (err, hash) {
            if (err) return next(err);

            // override the cleartext password with the hashed one
            team.password = hash;
            next();
        });
    });
});

TeamSchema.methods.comparePassword = function (candidatePassword, callback) {
    bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
        if (err) return callback(err);
        callback(null, isMatch);
    });
};

module.exports = mongoose.model('Team', TeamSchema);