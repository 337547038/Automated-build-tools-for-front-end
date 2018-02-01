var fs = require("fs");
var exec = require('child_process').exec;
var watch = require('./watch');
module.exports = function () {
    var package = JSON.parse(fs.readFileSync('./package.json'));
    var build = "";
    if (package.dist != "") {
        build = '--content-base ' + package.dist + '/';
    }
    var serverIp = "";
    if (package.serverIp != "") {
        serverIp = ' --host ' + package.serverIp;
    }
    //var option = 'webpack-dev-server --progress --colors --hot --inline ' + build + serverIp + ' --port ' + package.port + ' ';
    var option = 'webpack-dev-server ' + build + serverIp + ' --port ' + package.port + ' ';
    exec(option, function (err, stdout, stderr) {
        if (err) {
            console.error(`exec error: ${err}`);
            return;
        }
        //console.log(`stdout: ${stdout}`);
    });
    var url = 'http://localhost:' + package.port + '/';
    console.log('server running at ' + url + '');
    if (package.serverIp != "") {
        var urlIp = 'http://' + package.serverIp + ':' + package.port + '/';
        console.log('server running at ' + urlIp + '');
        exec('start ' + urlIp + '');//打开浏览器窗口
    } else {
        exec('start ' + url + '');
    }
    watch('server');
};
