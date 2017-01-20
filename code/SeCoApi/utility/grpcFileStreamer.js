/**
 * Created by PhilippMac on 12.01.17.
 */
"use strict";
function receiveFileStream(res, grpcCall, metadataParams, errParam, chunkParameter) {
    var metadataResult = {};
    res.header("Content-Type", 'application/octet-stream');

    var errRec = false;

    grpcCall.on('data', function (msgReceived) {
        _checkError(msgReceived, errParam, (errorCode, errMsg) => {
            if(errorCode && errMsg) {
                errRec = true;
                res.status(errorCode).send(errMsg);
            }
        });
        if(!errRec) res.write(msgReceived[chunkParameter]);
        //_handleChunk(msgReceived[chunkParameter],fileBuffer);
        _updateMetadata(msgReceived, metadataParams, metadataResult);
    });

    grpcCall.on('error',function(err){
       console.log(err);
    });

    grpcCall.on('end', function () {
        res.end();
    });
}


function _handleChunk(chunk, fileBuffer) {
    if (chunk.length > 0) {
        for (let i = 0; i < chunk.length; i++) {
            fileBuffer.push(chunk[i]);
        }
    }
}

function _checkError(msg, errorParam, cb) {
    if (msg[errorParam] !== '' && msg[errorParam] !== null) {
        console.log('filestreamer read stream err found');
        return cb(msg.err.code, msg.err.msg);
    } else {
        return cb(null, null);
    }
}

function _updateMetadata(msg, metadataParams, result) {
    for (let i = 0; i < metadataParams.length; i++) {
        let param = metadataParams[i];
        if (msg[param] !== '' && msg[param] !== null) {
            result[param] = msg[param];
        }
    }
}

module.exports = {
    receiveFileStream: receiveFileStream
};