var chokidar = require('chokidar');
var fs = require("fs");
var copy = require("./copy");
var cache = require("./cache");
var sass = require("./sass");
var sassInit = require("./sassInit");
var package0 = fs.readFileSync('./package.json');
const packageJson = JSON.parse(package0);
let sassJson = sassInit(true, packageJson, 'watch');//监听前首先编译一次样式，并返回json
module.exports = function (type) {
  //这里添加个参数，如果是从server过来时，在复制文件时在html页面插入一个js自动刷新脚本
  chokidar.watch('src', {ignored: /(^|[\/\\])\../}).on('all', function (event, path) {
    path = path.replace(/\\/g, '/');//将\换成/
    var out = './' + packageJson.dist + "/" + path.substr(4);
    out = out.replace('//', '/');
    switch (event) {
      case 'addDir':
        //这里只创建目录即可，除开特殊的sass,model,webpack
        if (path.indexOf('src/sass') != -1 || path.indexOf('src/model') != -1 || path.indexOf('src/webpack') != -1) {
        } else {
          fs.exists("./" + out, function (exists) {
            if (exists) {
              //存在
            } else {
              fs.mkdirSync("./" + out);
            }
          });
        }
        break;
      case 'add':
        //过滤掉有些编辑器产生这样那样的临时文件，如ps保存图片时没后缀的文件
        //webStorm自动保存时的___jb_tmp___
        if (path.indexOf('.') != -1 && path.indexOf('___jb_tmp___') == -1) {
          copy('./' + path, out, type);
        }
        //对新增的scss文件
        if (path.indexOf('.scss') !== -1) {
          sassJson = sassInit(true, packageJson, 'watch')
        }
        // console.log('add' + path);
        break;
      case 'change':
        //仅对指定的文件进行操作，即监听文件的类型
        var suffix = ['html', 'css', 'js', 'jpg', 'png', 'gif', 'scss'];
        var fileExtension = path.substr(path.lastIndexOf('.') + 1);
        if (suffix.indexOf(fileExtension) != -1 && path.indexOf('src/webpack') == -1) {
          //很多时候修改图片后复制过去后变成0字节的图片，这里设置延时
          if (fileExtension == "jpg" || fileExtension == "gif" || fileExtension == "png") {
            setTimeout(function () {
              copy('./' + path, out, type);
            }, 1000);
            //console.log('settimeout');
          } else {
            copy('./' + path, out, type);
            createModelCache(event, path);
            if (fileExtension == 'scss') {
              createSass(packageJson, path, sassJson)
              //sass(true, JSON.parse(package), 'watch');
            }
          }
          //监听到文件有变化时每次去修改下main.js，即可达到自动刷新
          editMainJs(path);
        }
        //console.log('change' + path);
        break;
      case 'unlink':
        //这里是删除文件，修改时有些编译器会先删除再新增。。
        //fs.unlink(out);
        //console.log('unlink');
        break;
    }
  });
  cache();
};
/*创建模板缓存*/
var createModelCache = function (event, path) {
  //仅在修改时,修改model下的模块时
  if (event == 'change' && path.indexOf('src/model/') != -1) {
    //要排除cache目录的，生成时也会触发change
    if (path.indexOf('src/model/cache/') == -1) {
      cache(path.replace('src/model/'));
    }
  }
};
var editMainJs = function (path) {
  //随便写点适合js格式的内容进去
  var content = "var a='" + path + " " + new Date().toLocaleTimeString() + "'";
  fs.writeFile("src/webpack/main.js", content, function (err) {
    if (err) throw err;
  });
};
/*sass处理*/
var createSass = function (package, path) {
//如果是以_开头的，则生成相对应的样式，否则直接生成
  //let path = './src/sass/index.scss'
  let index = path.lastIndexOf('/');
  let name = path.substr(index + 1);
  if (name.indexOf('_') !== 0) {
    //不以_开头
    //map, src, package, type
    //sass(true, path, package, 'watch');
    //这里的修改有可能会是添加引入新文件
    sassJson = sassInit(true, package, 'watch');
  } else {
    //读取临时生成的文件，查找到出前文件被哪个文件引用了
    sassJson.forEach((item) => {
      name = name.replace('_', '').replace('.scss', '');
      if (item.include.indexOf(name) !== -1) {
        sass(true, './src/sass/' + item.file, package, 'watch');
      }
    });
  }
};
