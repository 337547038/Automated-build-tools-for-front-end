const fs = require('fs');
const copy = require('./copy');
module.exports = function () {
  const config = JSON.parse(fs.readFileSync('./package.json'));
  deleteFile(config.dist, config.dist); // 清出输入目录及所有文件
  deleteFile('src/css', 'src/css', 'map'); // 删除src目录css地图文件
  deleteFile('src/model/cache', 'src/model/cache'); // 清除所有缓存临时文件
  // 创建两个文件夹
  mkdir('./' + config.dist);
  mkdir('./' + config.dist + '/css');
  copy('./src', "./" + config.dist, "build")
};

/* 创建目录 */
function mkdir(dst) {
  fs.exists(dst, function (exists) {
    // 已存在
    if (exists) {
    }
    // 不存在
    else {
      fs.mkdirSync(dst)
    }
  })
}

/* 清出输入目录及所有文件 */
function deleteFile(path, root, type) {
  let files = [];
  if (fs.existsSync(path)) {
    files = fs.readdirSync(path);
    files.forEach(function (file, index) {
      const curPath = path + "/" + file;
      if (fs.statSync(curPath).isDirectory()) { // recurse
        deleteFile(curPath, root)
      } else { // delete file
        if (type === 'map') {
          // 只删除.map文件
          if (curPath.indexOf('.css.map') !== -1) {
            fs.unlinkSync(curPath)
          }
        } else {
          fs.unlinkSync(curPath)
        }
      }
    });
    if (path !== root) {//要目录文件夹不删除
      fs.rmdirSync(path)
    }
  }
}
