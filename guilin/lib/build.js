var copy = require("./copy");
//var sass = require("./sass");
var fs = require("fs");
var cache = require("./cache");
var mergeJs = require("./mergeJs");
var sassInit = require("./sassInit");
var src = "./src";
module.exports = function () {
  fs.readFile('./package.json', {encoding: 'utf8'}, function (err, package) {
    //server(JSON.parse(package).port);
    var jsonPackage = JSON.parse(package);
    //先清空生成的文件
    deleteAll(jsonPackage.dist, jsonPackage.dist);
    //创建两个目录，有可能会不存在
    mkdir('./' + jsonPackage.dist);
    mkdir('./' + jsonPackage.dist + '/css');
    //sass(false, jsonPackage, 'build');//false不生成地图
    copy(src, "./" + jsonPackage.dist, "build");
    mergeJs();
    sassInit(false, jsonPackage, 'build');
  });
  cache();
};

function mkdir(dst) {
  fs.exists(dst, function (exists) {
    // 已存在
    if (exists) {
    }
    // 不存在
    else {
      fs.mkdirSync(dst);
    }
  });
}

function deleteAll(path, root) {
  var files = [];
  if (fs.existsSync(path)) {
    files = fs.readdirSync(path);
    files.forEach(function (file, index) {
      var curPath = path + "/" + file;
      if (fs.statSync(curPath).isDirectory()) { // recurse
        deleteAll(curPath, root);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    if (path != root) {//要目录文件夹不删除
      fs.rmdirSync(path);
    }
  }
}
