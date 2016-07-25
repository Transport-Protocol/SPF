/**
 * Created by PhilippMac on 25.07.16.
 */
var connector = require('./owncloud');

connector.getFileTree("",function(err,dirs){
   console.log(dirs);
});