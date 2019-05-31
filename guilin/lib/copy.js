const fs = require("fs");
const sass = require("./sass");
const cache = require("./cache");
const puppeteer = require("./puppeteer");
const uglifyJS = require('./uglifyJS');
const sprites = require('./sprites');
const beautify = require('js-beautify');
/* 复制文件或文件夹
* src可以是一个文件路径，也可以是一个目录
* dist 输出路径
* type 被引用来源有init watch build
* event 触发事件类型，仅在type=watch时
* */
module.exports = function (src, dist, type, event) {
  fs.stat(src, function (err, st) {
    if (err) {
      throw err;
    } else {
      // 判断是否为文件
      if (st.isFile()) {
        copyFile(src, dist, type, event)
      } else if (st.isDirectory()) {
        // 如果是目录则递归调用自身
        exists(src, dist, copyDirectory, type, event)
      }
    }
  })
};

/* 复制文件 */
function copyFile(src, dist, type, event) {
  //不复制以.开头的文件
  if (src.indexOf('/.') === -1) {
    if (type === 'init') {
      // 直接复制
      fs.createReadStream(src).pipe(fs.createWriteStream(dist))
    } else {
      // 这里是watch或build时
      // 排除1个不处理的目录src/webpack不处理
      if (src.indexOf('src/webpack') === -1) {
        if (src.indexOf('src/sass') !== -1) {
          // 如果是scss文件时，不是以_开头的才处理
          if (src.lastIndexOf('/_') === -1) {
            sass(src, type)
          }
        } else if (src.indexOf('src/model') !== -1) {
          if (event === 'change') {
            cache(src, type)
          }
        } else if (src.indexOf('src/sprites') !== -1) {
          // 精灵图文件夹，仅在icons里的图片文件变动时处理
          if (src.indexOf('src/sprites/icons') !== -1 && type !== 'build') {
            sprites(src)
          }
          // console.log('sprites:' + src)
        } else if (src.indexOf('.html') !== -1) {
          // 如果是html文件
          copyHtml(src, dist, type, event)
        } else if (src.indexOf('.js') !== -1) {
          // 是js文件
          uglifyJS(src, dist); // 在同目录生成.min
          // 复制js并格式化
          // fs.createReadStream(src).pipe(fs.createWriteStream(dist));
          // console.log(src + ' => ' + dist)
          copyJs(src, dist)
        } else {
          // 其他情况，直接复制
          fs.createReadStream(src).pipe(fs.createWriteStream(dist));
          console.log(src + ' => ' + dist)
        }
      }
    }
  }
}

let includeHtml = [];
let includeHas = [];

/* 复制html */
function copyHtml(src, dist, type, event) {
  //查找替换标签再复制
  fs.readFile(src, {
    // 需要指定编码方式，否则返回原生buffer
    encoding: 'utf8'
  }, function (err, data) {
    // <!-- include href="header.html" -->
    // 这段HTML替换成href文件中的内容，所有include文件都放在model目录下
    let dataReplace = data.replace(/<!--\sinclude\shref="(.*)"\s-->/gi, function (matchs, m1) {
      // m1就是匹配的路径地址了
      // 如果地址包含有参数，首先读取缓存文件，没有时则先生成缓存文件再重新生成当前文件
      let htmlPath = m1;
      if (includeHas.indexOf(m1 + src) === -1) {
        includeHas.push(m1 + src);
        includeHtml.push({
          include: m1,
          src: src,
          dist: dist
        });
        writeFileArry(includeHtml);
      }
      if (m1.indexOf('?') !== -1) {
        m1 = "cache/" + encodeURIComponent(m1)
      }
      // 如果m1文件不存在时，则返回空
      if (fs.existsSync('./src/model/' + m1)) {
        return fs.readFileSync('./src/model/' + m1, {
          encoding: 'utf8'
        })
      } else {
        // return ''
        // 没有时，先去生成缓存文件，然后重新生成当前文件
        if (htmlPath.indexOf('?') !== -1) {
          puppeteer(htmlPath, copyHtml.bind(this, src, dist, type, event))
        }
      }
    });
    if (type === "server") {
      // 如果是运行了服务命令过来的，则在页面中添加一段js脚本
      dataReplace += '<script type="text/javascript" src="/bundle.js"></script>';
    }
    // 格式化输出
    const opt = {
      "indent_size": 2,
      "extra_liners": '' // List of tags (defaults to [head,body,/html] that should have an extra newline before them.
    };
    fs.writeFile(dist, beautify.html(dataReplace, opt), {
      encoding: 'utf8'
    }, function (err) {
      if (err) throw err;
      console.log(src + ' => ' + dist)
    })
  })
}

/* 复制并格式化 js */
function copyJs(src, dist) {
  fs.readFile(src, {encoding: 'utf8'}, function (err, data) {
    fs.writeFile(dist, beautify(data, {indent_size: 2}), {
      encoding: 'utf8'
    }, function (err) {
      if (err) throw err;
      console.log(src + ' => ' + dist)
    })
  })
}

/* 生成缓存临时文件 */
function writeFileArry(array) {
  if (!fs.existsSync('./src/model/cache/')) {
    fs.mkdirSync('./src/model/cache/')
  }
  fs.writeFile("./src/model/cache/cache.json", JSON.stringify(array, null, 2), function (err) {
    if (err) throw err;
    console.log("add cache.json success.")
  })
}

/* 复制目录及目录下的文件 */
function copyDirectory(src, dist, type, event) {
  // 读取目录中的所有文件/目录
  fs.readdir(src, function (err, paths) {
    if (err) {
      throw err
    }
    paths.forEach(function (path) {
      const newSrc = src + '/' + path;
      const newDist = dist + '/' + path;
      fs.stat(newSrc, function (err, st) {
        if (err) {
          throw err
        }
        // 判断是否为文件
        if (st.isFile()) {
          copyFile(newSrc, newDist, type, event)
        }
        // 如果是目录则递归调用自身
        else if (st.isDirectory()) {
          if (type !== 'init' && (newSrc.indexOf('src/sass') !== -1 || newSrc.indexOf('src/model') !== -1 || newSrc.indexOf('src/webpack') !== -1 || newSrc.indexOf('src/sprites') !== -1)) {
            // 不创建目录，但对里面的文件要进行复制
            copyDirectory(newSrc, newDist, type, event)
          } else {
            exists(newSrc, newDist, copyDirectory, type, event)
          }
        }
      })
    })
  })
}

/*判断是否存在*/
function exists(src, dist, callback, type, event) {
  fs.access(dist, function (exists) {
    if (!exists) {
      // 已存在
      callback(src, dist, type, event)
    }
    else {
      // 不存在
      fs.mkdir(dist, function () {
        callback(src, dist, type, event)
      })
    }
  })
}

