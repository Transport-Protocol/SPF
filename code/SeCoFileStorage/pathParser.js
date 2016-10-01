/**
 * Created by PhilippMac on 01.10.16.
 */


/**
 *
 * @param path
 * @returns {path and fileName}
 */
function parsePath(path){
    if(!path || path === undefined) return null;
    var splitted = path.split('/');
    if(splitted.length === 0){
        //no '/' found, root directory
        return {
            path: '',
            fileName: path
        }
    }
    var filePath = '';
    for(var i = 0;i<splitted.length-1;i++){
        if(i > 0){
            filePath += '/';
        }
        filePath += splitted[i];
    }
    return {
        path: filePath,
        fileName: splitted[splitted.length-1]
    }
}


module.exports= {
    parsePath: parsePath
}