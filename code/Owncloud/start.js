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

connector.getFile('ownCloudUserManual.pdf',function(err,dirs){
    if(!err) {
        console.log(dirs);
    } else {
        console.log(err);
    }
});