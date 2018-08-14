var fs = require("fs");
/*
 * 复制目录中的所有文件
 */
module.exports = function (src, dist, type) {
  //watch过来时src是文件，build过来时src是目录
  fs.stat(src, function (err, st) {
    if (err) {
      throw err;
    } else {
      // 判断是否为文件
      if (st.isFile()) {
        copy(src, dist, type);
      } else if (st.isDirectory()) {
        // 如果是目录则递归调用自身
        exists(src, dist, copyFileDirectory, type);
      }
    }
  });

};
var copy = function (src, dist, type) {
  // 读取目录中的所有文件
  if (src.indexOf('src/sass') != -1 || src.indexOf('src/model') != -1 || src.indexOf('src/webpack') != -1) {
    //排除两个目录
  } else {
    if (src.indexOf(".html") != -1) {
      //如果是html文件
      copyHtml(src, dist, type);
    } else {
      //不复制以.开头的文件
      if (src.indexOf('/.') === -1) {
        fs.createReadStream(src).pipe(fs.createWriteStream(dist));
        console.log(src + ' => ' + dist);
      }
    }
  }
};
var arry = [];
var copyHtml = function (src, dist, type) {
  //查找替换标签再复制
  fs.readFile(src, {
    // 需要指定编码方式，否则返回原生buffer
    encoding: 'utf8'
  }, function (err, data) {
    // <!-- include href="header.html" -->
    // 这段HTML替换成href文件中的内容，所有include文件都放在model目录下
    var dataReplace = data.replace(/<!--\sinclude\shref="(.*)"\s-->/gi, function (matchs, m1) {
      // m1就是匹配的路径地址了
      //如果地址包含有参数，这里不去生成，引用一次生成一次太耗资源，提取链接到保存起来
      if (m1.indexOf('?') != -1) {
        if (arry.indexOf(m1) == -1) {
          arry.push(m1);
          writeFileArry(arry);
        }
        //phantom(m1);
        m1 = "cache/" + encodeURIComponent(m1);
      }
      //如果m1文件不存在时，则返回空
      if (fs.existsSync('./src/model/' + m1)) {
        return fs.readFileSync('./src/model/' + m1, {
          encoding: 'utf8'
        });
      } else {
        return ''
      }
    });
    if (type == "server") {
      //如果是运行了服务命令过来的，则在页面中添加一段js脚本
      dataReplace += '<script type="text/javascript" src="/bundle.js"></script>';
    }
    fs.writeFile(dist, dataReplace, {
      encoding: 'utf8'
    }, function (err) {
      if (err) throw err;
      console.log(src + ' => ' + dist);
    });

  });
};
var writeFileArry = function (array) {
  var data = array.join("\n");
  if (!fs.existsSync('./src/model/cache/')) {
    fs.mkdirSync('./src/model/cache/');
  }
  fs.writeFile("./src/model/cache/cache.txt", data + '\n', function (err) {
    if (err) throw err;
    console.log("add cache.txt success.");
  });
};
/*build时复制目录*/
var exists = function (src, dst, callback, type) {
  fs.exists(dst, function (exists) {
    // 已存在
    if (exists) {
      callback(src, dst, type);
    }
    // 不存在
    else {
      fs.mkdir(dst, function () {
        callback(src, dst, type);
      });
    }
  });
};
var copyFileDirectory = function (src, dst, type) {
  // 读取目录中的所有文件/目录
  fs.readdir(src, function (err, paths) {
    if (err) {
      throw err;
    }
    paths.forEach(function (path) {
      var _src = src + '/' + path,
      _dst = dst + '/' + path
      fs.stat(_src, function (err, st) {
        if (err) {
          throw err;
        }
        // 判断是否为文件
        if (st.isFile()) {
          copy(_src, _dst, type);
        }
        // 如果是目录则递归调用自身
        else if (st.isDirectory()) {
          if (_src.indexOf('src/sass') != -1 || _src.indexOf('src/model') != -1 || _src.indexOf('src/webpack') != -1) {
          }
          else {
            exists(_src, _dst, copyFileDirectory, type);
          }
        }
      });
    });
  });
};
