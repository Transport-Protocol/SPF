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

connector.getFile('BA-Philipp/Umfrage/Umfrage.pdf',function(err,fileName,buffer){
    if(!err) {
        console.log('%s retrieved; buffer: %s', fileName,buffer);
    } else {
        console.log(err);
    }
});

var fs = require('fs');

fs.readFile("test.pdf", function (err, data) {
    if (err) throw err;
    console.log(data);
    connector.uploadFile('BA-Philipp',data,'test5.pdf', function(err,msg){
        if(err){
            console.log(err);
        } else {
            console.log(msg);
        }
    });
});

