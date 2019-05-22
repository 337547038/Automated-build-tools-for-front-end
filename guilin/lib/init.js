const fs = require("fs");
const config = require("../package.json");
const copy = require('../lib/copy');
module.exports = function () {
  const data = {
    name: config.name,
    version: config.version,
    dist: 'build', // 打包后输出目录，默认为根目录
    port: '8090',
    serverIp: "", // 服务器ip，开启服务时可以通过ip地址访问，否则只能使用localhost访问
    outputStyle: 'compressed', // sass输出类型,可选nested，expanded，compact，compressed(默认)
    autoPreFixer: true, // 自动添加兼容后缀
    uglifyjs: false, // 压缩js，同目录下生成一个.min
    // mergeJs: "", // 合并js,用+号连接，如a.js+b.js
    // mergaJsName: "", // 合并后的js输出文件名
    imgToBase64: false,// 将样式中的背景图片转为base64
    imgLimit: 10, // 图片转换base64最大值，大于此值不转换，单位k
    //imgToBaseDel: false,// 转换后删除图片，如果多个样式引用同一个图片，删除图片会出错，此时建议设为false
    scripts: {
      "build": "guilin build",
      "watch": "guilin watch",
      "server": "guilin server"
    }
  };
  fs.writeFile("package.json", JSON.stringify(data, null, 2), function (err) {
    if (err) throw err
  });
  //将一些静态资源复制到项目目录
  copy(__dirname.replace("lib", "static"), './', 'init');
  console.log('successful init')
};
