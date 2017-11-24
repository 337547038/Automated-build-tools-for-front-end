var copy = require("./copy");
var sass = require("./sass");
var fs = require("fs");
var cache = require("./cache");
var mergeJs = require("./mergeJs");
var src = "./src";
module.exports = function () {
    fs.readFile('./package.json', {encoding: 'utf8'}, function (err, package) {
        //server(JSON.parse(package).port);
        var jsonPackage = JSON.parse(package);
        sass(false, jsonPackage, 'build');//false不生成地图
        copy(src, "./" + jsonPackage.dist,"build");
        mergeJs();
    });
    cache();
};