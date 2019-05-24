const fs = require("fs");
const exec = require('child_process').exec;
const net = require('net');
const watch = require('./watch');
module.exports = function () {
  const config = JSON.parse(fs.readFileSync('./package.json'));
  let build = "";
  if (config.dist !== "") {
    build = '--content-base ' + config.dist + '/'
  }

  let serverIp = "";
  if (config.serverIp !== "") {
    serverIp = ' --host ' + config.serverIp
  }
  let portUrl = 'localhost';
  if (config.serverIp !== "") {
    portUrl = config.serverIp
  }
  watch('server');
  const port = portIsOccupied(parseInt(config.port), portUrl, function (port) {
    const option = `webpack-dev-server ${build} ${serverIp} --port ${port} --mode development --config src/webpack/webpack.config.js`;
    exec(option, function (err, stdout, stderr) {
      if (err) {
        console.error(`exec error: ${err}`);
        return
      }
      console.log(`stdout: ${stdout}`)
    });
    const url = `http://${portUrl}:${port}/`;
    setTimeout(function () {
      console.log('\x1B[32m%s\x1B[39m', 'server running at ' + url);
      exec('start ' + url)// 打开浏览器窗口，设置延时打开窗口，很多时候服务还没启动，窗口就打开了，显示出错
    }, 3000)
  })
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
  })
  // return port
}
