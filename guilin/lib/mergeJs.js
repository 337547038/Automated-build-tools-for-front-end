var fs = require("fs");
var exec = require('child_process').exec;
//合并js
module.exports = function () {
    fs.readFile('./package.json', {encoding: 'utf8'}, function (err, package) {
        var jsonPackage = JSON.parse(package);
        if (jsonPackage.mergeJs != "") {
            //这里只合并
            var merge = "src\\js\\" + jsonPackage.mergeJs.replace(/\+/g, "+src\\js\\");
            var outPath = "src\\js\\" + jsonPackage.mergaJsName;
            var option = 'copy ' + merge + ' ' + outPath + ' /b';
            exec(option, function (err, stdout, stderr) {
                if (err) {
                    console.error("error");
                    return;
                }else{
                    console.error("Successfully merge js");
                }
            });
        }
    });
};