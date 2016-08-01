/**
 * Created by PhilippMac on 25.07.16.
 */
var connector = require('./owncloud');

var grpc = require('grpc');
var fileStorageProto = grpc.load('./proto/fileStorage.proto').fileStorage;

/**
 * Implements the GetFile RPC method.
 */
function getFile(call, callback) {
    console.log(call.request.username);
    connector.getFile(call.request.username, call.request.password, call.request.path, function (err, fileName, fileBuffer) {
        callback(null, {fileName: fileName, fileBuffer: fileBuffer});
    });
}


/**
 * Implements the GetFile RPC method.
 */
function getFileTree(call, callback) {
    console.log('getFileTree: ' + JSON.stringify(call.request));
    connector.getFileTree(call.request.username, call.request.password, call.request.path, function (err, dirs) {
        if (err) {
            console.log(err);
            callback(null,{err: err.msg});
        } else {
            console.log('dirs: ' + dirs);
            callback(null,{dirs: dirs});
        }
    });
}


var server = new grpc.Server();
server.addProtoService(fileStorageProto.FileStorage.service, {getFile: getFile, getFileTree: getFileTree});
server.bind('localhost:50051', grpc.ServerCredentials.createInsecure());
server.start();