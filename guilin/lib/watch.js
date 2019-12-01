/**
 * Created by 337547038
 * 2019
 * https://github.com/337547038/Automated-build-tools-for-front-end
 */
const chokidar = require('chokidar');
const fs = require("fs");
const copy = require("./copy");
const sass = require("./sass");
/* 监听文件，server命令也是引用watch，type作为参数用于区别
* type:server 表示来源是server，其它时候为空
* */
module.exports = function (type) {
  if (!type) {
    type = 'watch'
  }
  const config = JSON.parse(fs.readFileSync('./package.json'));
  //这里添加个参数，如果是从server过来时，在复制文件时在html页面插入一个js自动刷新脚本
  chokidar.watch('src', {ignored: /(^|[\/\\])\../}).on('all', function (event, path) {
    // path带有src/开头
    path = path.replace(/\\/g, '/');// 将\换成/
    const dist = './' + config.dist + "/" + path.substr(4);
    const src = './' + path;
    switch (event) {
      case 'addDir':
        // 这里只创建目录即可，除开特殊的sass,model,webpack
        if (path.indexOf('src/sass') !== -1 || path.indexOf('src/model') !== -1 || path.indexOf('src/webpack') !== -1 || path.indexOf('src/static/sprites') !== -1) {
        } else {
          fs.access("./" + dist, function (exists) {
            if (exists) {
              // 不存在
              fs.mkdirSync("./" + dist)
            }
          })
        }
        break;
      case 'add':
        // 过滤掉有些编辑器产生这样那样的临时文件，如ps保存图片时没后缀的文件
        // webStorm自动保存时的___jb_tmp___
        if (path.indexOf('.') !== -1 && path.indexOf('___jb_tmp___') === -1) {
          copy(src, dist, type)
        }
        break;
      case 'change':
        // 仅对指定的文件进行操作，即监听文件的类型
        const suffix = ['html', 'css', 'js', 'jpg', 'png', 'gif', 'scss'];
        const fileExtension = path.substr(path.lastIndexOf('.') + 1);
        if (suffix.indexOf(fileExtension) !== -1 && path.indexOf('src/webpack') === -1) {
          // 很多时候修改图片后复制过去后变成0字节的图片，这里设置延时
          if (fileExtension === "jpg" || fileExtension === "gif" || fileExtension === "png") {
            setTimeout(function () {
              copy(src, dist, type)
            }, 1000);
          } else if (fileExtension === 'scss' && path.lastIndexOf('/_') !== -1) {
            // 这里特殊处理下，以_开头的scss文件
            sass('directory')
          } else {
            copy(src, dist, type, event)
          }
          // 监听到文件有变化时每次去修改下main.js，即可达到自动刷新
          const content = `var a='${path} + ${new Date().toLocaleTimeString()}'`;
          fs.writeFile("src/webpack/main.js", content, function (err) {
            if (err) throw err
          })
        }
        break;
      case 'unlink':
        // 这里是删除文件，修改时有些编译器会先删除再新增。。所以这里暂不作处理
        // fs.unlink(out);
        // console.log('unlink');
        break
    }
  })
};
