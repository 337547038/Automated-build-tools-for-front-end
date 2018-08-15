var fs = require("fs");
var sass = require('node-sass');
var autoprefixer = require('autoprefixer');
var postcss = require('postcss');

//map true时生成sourceMap，src sass路径,type build不输出信息
module.exports = function (map, src, package, type) {
  /*var src = './src/sass/index.scss';
  var dist = './src/css/index.css';*/
  // 输出路径为./src/css/同输入文件名.css
  var outputStyle = package.outputStyle || 'compressed';
  var dist = src.replace('/sass/', '/css/').replace('.scss', '.css');
  var auto = package.autoPreFixer;
  //sassNode(src, outputStyle, dist, map, auto);
  sass.render({
    file: src,
    outputStyle: outputStyle,//Type: String Default: nested Values: nested, expanded, compact, compressed
    outFile: dist,//生成map所需的选项，并不会生成文件
    sourceMap: map
  }, function (err, result) {
    if (err) {
      console.log('error ' + err.line + ":" + err.column);
      console.log(err.message);
    } else {
      //css内容,输出路经,是否输出log,是否添加前缀,类型,是否生成地图
      autoPreFixer(result.css.toString(), dist, type, auto, map, src);
      if (map) {
        writeFiles(result.map.toString(), dist + '.map', false);
      }
      if (type === 'build') {
        // 打包时直接生成一份到打包后的目录
        // 这里设置延时时间，有可能会存在先生成到打包目录，然后被复制过来的覆盖掉
        setTimeout(() => {
          let out = dist.replace('src', package.dist);
          autoPreFixer(result.css.toString(), out, type, auto, false, src);
        }, 1000);
      }
    }
  });
};

function autoPreFixer(css, outPath, type, auto, map, inputPath) {
  let log = type == 'build' ? false : true;
  if (auto) {
    //编译后再将样式添加兼容前缀时会去掉map信息，watch时追加回去。（暂没找到配置办法）
    var sourceMap = '';
    if (type == 'watch' && map) {
      sourceMap = '/*# sourceMappingURL=' + outPath.replace('./src/css/', '') + '.map */';
    }
    postcss([autoprefixer])
    .process(css, {from: inputPath, to: outPath})
    .then(result => {
      writeFiles(result.css + sourceMap, outPath, log);
      //fs.writeFile('dest/app.css', result.css);
      //if ( result.map ) fs.writeFile('dest/app.css.map', result.map);
    });
  } else {
    writeFiles(css, outPath, log)
  }
}

function writeFiles(content, filename, log) {
  fs.writeFile(filename, content, {
    encoding: 'utf8'
  }, function (err) {
    if (err) {
      throw err;
    }
    if (log) {
      console.log(filename + " " + new Date().toLocaleTimeString());
    }
  });
}
