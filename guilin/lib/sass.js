/**
 * Created by 337547038.
 */
const fs = require("fs");
const sass = require('node-sass');
const autoprefixer = require('autoprefixer');
const postcss = require('postcss');
/* 编辑css
 * path:单个文件路径时，编译当前。path=directory目录时，编译当前路径下所有不以_开头的 */
module.exports = function (path, type) {
  const config = JSON.parse(fs.readFileSync('./package.json'));
  if (path === 'directory') {
    // 目录时，侧编译sass目录下所有不以_开头的scss，仅处理一级目录
    fs.readdir('src/sass/', function (err, paths) {
      if (err) {
        throw err
      }
      paths.forEach(function (src) {
        if (src.indexOf('_') !== 0) {
          // 不是以_开头
          const dist = 'src/css/' + src.replace('.scss', '.css');
          // sassRender(outputStyle, dist, map, auto, type, 'src/sass/' + src)
          sassRender(config, dist, type, 'src/sass/' + src)
        }
      })
    })
  } else {
    const dist = path.replace('/sass/', '/css/').replace('.scss', '.css');
    sassRender(config, dist, type, path)
  }
};

function sassRender(config, dist, type, path) {
  const outputStyle = config.outputStyle || 'compressed';
  // const auto = config.autoPreFixer;
  let map = false; // 监听时生成地图
  if (type === 'watch' || type === 'server') {
    map = true
  }
  // const imgToBase64 = config.imgToBase64;
  sass.render({
    file: path,
    outputStyle: outputStyle,//Type: String Default: nested Values: nested, expanded, compact, compressed
    outFile: dist,// 生成map所需的选项，并不会生成文件
    // sourceComments: true,
    //sourceMapContents: true,
    sourceMap: map
  }, function (err, result) {
    if (err) {
      console.log('\x1B[31m%s\x1B[39m', 'error ' + err.line + ":" + err.column);
      console.log('\x1B[31m%s\x1B[39m', err.message)
    } else {
      //css内容，输出路径，类型，兼容前缀，地图，源文件路径
      autoPreFixer(result.css.toString(), dist, type, config, map, path);
      if (map) {
        writeFiles(result.map.toString(), dist + '.map', false)
      }
    }
  })
}

/* 添加前缀 */
function autoPreFixer(css, outPath, type, config, map, inputPath) {
  if (config.autoPreFixer) {
    //编译后再将样式添加兼容前缀时会去掉map信息，watch时追加回去。（暂没找到配置办法）
    let sourceMap = '';
    if (map) {
      sourceMap = `\r\r/*# sourceMappingURL=${outPath.replace('./src/css/', '')}.map */`
    }
    postcss([autoprefixer])
      .process(css, {from: inputPath, to: outPath})
      .then(result => {
        // writeFiles(result.css + sourceMap, outPath, log)
        imgToBase64(result.css + sourceMap, outPath, type, config)
      })
  } else {
    // writeFiles(css, outPath, log)
    imgToBase64(css, outPath, type, config, type)
  }
}

/* 图片转base64 */
function imgToBase64(content, dist, type, config) {
  let log = type === 'watch';
  const outPath = dist.replace('src/css', `${config.dist}/css`);
  if (config.imgToBase64) {
    const dataReplace = content.replace(/url\((.+?)\)/gi, function (matchs, m1) {
      // 检查图片存在
      // 有些背景加了双引号的，这里去掉
      m1 = m1.replace(/"/g, "");
      let imgPath = "./src/" + m1;// 转换图片路径
      imgPath = imgPath.replace("../", "").replace(/\/\//g, "/");
      if (fs.existsSync(imgPath)) {
        const bData = fs.readFileSync(imgPath);
        if (bData.length / 1024 < config.imgLimit) {//小于imgLimit K
          const suffix = m1.substr(m1.length - 3, m1.length); // 取最后三位
          // 从生成路径中删除当前图片
          let delPath = './' + config.dist + '/' + m1;
          delPath = delPath.replace("../", "").replace(/\/\//g, "/");
          // 可能会出现图片还没复制过来
          setTimeout(() => {
            fs.unlink(delPath, function (err) {
              if (err) {
                console.log(`Image deletion failed:${delPath}`)
              }
            })
          }, 1000);
          return `url(data:image/${suffix};base64,${bData.toString('base64')})`
        } else {
          return `url(${m1})`
        }
      } else {
        return `url(${m1})`
      }
    });
    writeFiles(dataReplace, dist, log, outPath, type);
    /*if (type === 'build') {
      // 生成后复制一份到输出目录
      fs.createReadStream(dist).pipe(fs.createWriteStream(outPath))
    }*/
  } else {
    writeFiles(content, dist, log, outPath, type);
    /*if (type === 'build') {
      // 生成后复制一份到输出目录
      fs.createReadStream(dist).pipe(fs.createWriteStream(outPath))
    }*/
  }
}

function writeFiles(content, filename, log, outPath, type) {
  fs.writeFile(filename, content, {
    encoding: 'utf8'
  }, function (err) {
    if (err) {
      throw err;
    }
    if (log) {
      console.log(filename + " " + new Date().toLocaleTimeString())
    }
    if (type === 'build') {
      // 生成后复制一份到输出目录
      // console.log('\x1B[33m%s\x1B[39m', '编译成功')
      fs.createReadStream(filename).pipe(fs.createWriteStream(outPath))
    }
  })
}
