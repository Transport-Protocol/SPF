/**
 * Created by PhilippMac on 02.09.16.
 */
var express = require('express'),
    app = express(),
    OAuth2 = require('./oauth2/basicOauth2'),
    fs = require('fs'),
    nconf = require('nconf');

nconf.argv()
    .env()
    .file({file: './config/config.json'});

app.get('/', function (req, res) {
    res.send('i am running');
});

app.listen(nconf.get('httpPort'), function () {
    console.log('authentication service http server listening on port %d!',nconf.get('httpPort'));
});


var path = './oauth2/services';
var services = fs.readdirSync(path);

for(var i = 0;i<services.length;i++){
    var oauth2 = new OAuth2(path + '/' +  services[i],function(err){
       if(err){
           console.log(err);
       } else {
           console.log(oauth2.getAuthorizationURL('philipp'));
           app.get(oauth2.getRedirectRoute(),function(req,res){
               console.log('redirect received');
               res.send('ty');
           });
       }
    });
}
