var phantom = require("./phantom");
var fs = require("fs");
/*有路径参数时，查找当前路径的重新生成，否则生成全部*/
module.exports = function (filesName) {
    var path = './src/model/cache/cache.txt';
    fs.exists(path, function (exists) {
        if (exists) {
            fs.readFile(path, {encoding: 'utf8'}, function (err, data) {
                if (err) {
                    throw err;
                }
                if (data != '') {
                    var cache = data.split('\n');
                    for (var i = 0; i < cache.length; i++) {
                        if (cache[i] != '') {
                            if (filesName) {
                                if (cache[i].indexOf(filesName) != -1) {
                                    phantom(cache[i])
                                } 
                            } else {
                                phantom(cache[i])
                            }
                        }
                    }
                }
            })
        }
    });
};