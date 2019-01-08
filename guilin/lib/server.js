var fs = require("fs");
var exec = require('child_process').exec;
var watch = require('./watch');
var net = require('net');
module.exports = function () {
  var package = JSON.parse(fs.readFileSync('./package.json'));
  var build = "";
  if (package.dist !== "") {
    build = '--content-base ' + package.dist + '/';
  }

  var serverIp = "";
  if (package.serverIp !== "") {
    serverIp = ' --host ' + package.serverIp;
  }
  var url = 'http://localhost:';
  let portUrl = 'localhost';
  if (package.serverIp !== "") {
    url = 'http://' + package.serverIp + ':';
    portUrl = package.serverIp
  }
  const port = portIsOccupied(parseInt(package.port), portUrl, function (port) {

    //var option = 'webpack-dev-server --progress --colors --hot --inline ' + build + serverIp + ' --port ' + package.port + ' ';
    var option = 'webpack-dev-server ' + build + serverIp + ' --port ' + port + ' --mode development --config src/webpack/webpack.config.js';
    exec(option, function (err, stdout, stderr) {
      if (err) {
        console.error(`exec error: ${err}`);
        return;
      }
      //console.log(`stdout: ${stdout}`);
    });
    console.log('server running at ' + url + port + '/');
    setTimeout(function () {
      exec('start ' + url + port + '/');//打开浏览器窗口，设置延时打开窗口，很多时候服务还没启动，窗口就打开了，显示出错
    }, 3000);
    watch('server');

  });
};

// 检测端口有没在使用
function portIsOccupied(port, url, callback) {
  const server = net.createServer().listen(port, url);
  //const server=net.createServer().listen(port)
  server.on('listening', () => {
    // console.log(`端口可用 ${port}`);
    server.close();
    // return port
    callback(port)
  });
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      portIsOccupied(port + 1, url, callback); // 不可用时加1
      console.log(`this port ${port} is occupied.try another.`)
    }
  });
  // return port
}
