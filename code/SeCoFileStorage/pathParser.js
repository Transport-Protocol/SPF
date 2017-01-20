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
            path: 'root',
            fileName: path
        }
    }
    var filePath = 'root';
    for(var i = 0;i<splitted.length-1;i++){
        filePath += '/';
        filePath += splitted[i];
    }
    if(filePath.charAt(filePath.length-1) === '/'){
        filePath = filePath.substr(0,filePath.length-1);
    }
    return {
        path: filePath,
        fileName: splitted[splitted.length-1]
    }
}


module.exports= {
    parsePath: parsePath
}