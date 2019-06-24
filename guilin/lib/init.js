/**
 * Created by 337547038
 * 2019
 * https://github.com/337547038/Automated-build-tools-for-front-end
 */
const fs = require("fs");
const config = require("../package.json");
const copy = require('./copy');
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
    spritesWidth: 500, // css sprites图片的宽
    codeCheck: {
      // 代码质量检查
      lintExclude: ['model', 'font', 'sprites', 'static'], // html代码检查时排除的目录
      screenshots: true, // 检查时是否拍照截图
      isMobile: false // 是否模拟手机端拍照截图，移动端项目时设为true
    },
    scripts: {
      "build": "guilin build",
      "watch": "guilin watch",
      "server": "guilin server",
      "sprites": "guilin sprites",
      "stylelint": "guilin stylelint",
      "htmlhint": "guilin htmlhint"
    }
  };
  fs.writeFile("package.json", JSON.stringify(data, null, 2), function (err) {
    if (err) throw err
  });
  fs.access('./src', function (err) {
    if (err) {
      // 不存在目录时，将一些静态资源复制到项目目录
      copy(__dirname.replace("lib", "static"), './', 'init');
      console.log('successful init')
    } else {
      console.log('\x1B[33m%s\x1B[39m', 'The project already exists and the package.json was successfully updated.')
    }
  })
};
