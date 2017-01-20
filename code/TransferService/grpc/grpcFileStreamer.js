/**
 * Created by PhilippMac on 12.01.17.
 */
"use strict";

function receiveFileStream(grpcCall,metadataParams,errParam,chunkParameter,cb){
    var metadataResult = {};
    var err;
    var fileBuffer = [];
    grpcCall.on('data', function (msgReceived) {
        console.log('got data');
        _handleChunk(msgReceived[chunkParameter],fileBuffer);
        _updateMetadata(msgReceived,metadataParams,metadataResult);
        err = _checkError(msgReceived,errParam,err);
    });
    grpcCall.on('end', function () {
        console.log('end');
        if (err) {
            return cb(err);
        } else {
            return cb(null,metadataResult,fileBuffer);
        }
    });
}

function _handleChunk(chunk,fileBuffer){
    if(chunk.length > 0){
        for(let i = 0;i<chunk.length;i++){
            fileBuffer.push(chunk[i]);
        }
    }
}

function _checkError(msg,errorParam){
    var errResult;
    if(msg[errorParam] !== ''){
        console.log('filestreamer read stream err found');
        errResult = msg[errorParam];
    }
    return errResult;
}

function _updateMetadata(msg,metadataParams,result){
    for(let i = 0;i<metadataParams.length;i++){
        let param = metadataParams[i];
        if(msg[param] !== '' && msg[param] !== null){
            console.log(param);
            result[param] = msg[param];
        }
    }
}

module.exports = {
    receiveFileStream : receiveFileStream
};