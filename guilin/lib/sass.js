var fs = require("fs");
var sass = require('node-sass');
var autoprefixer = require('autoprefixer');
var postcss = require('postcss');

var sassNode = function (inputPath, outputStyle, outputPath, map, auto, type, outputPath2) {
    sass.render({
        file: inputPath,
        outputStyle: outputStyle,//Type: String Default: nested Values: nested, expanded, compact, compressed
        outFile: outputPath,//生成map所需的选项，并不会生成文件
        sourceMap: map
    }, function (err, result) {
        if (err) {
            console.log('error ' + err.line + ":" + err.column);
            console.log(err.message);
        } else {
            //css内容,输出路经,是否输出log,是否添加前缀,类型,是否生成地图
            autoPreFixer(result.css.toString(), outputPath, true, auto, type, map);
            if (type == 'build') {
                //打包时直接生成一份到打包后的目录
                autoPreFixer(result.css.toString(), outputPath2, true, auto, type, map);
            }
            if (map) {
                writeFiles(result.map.toString(), outputPath + '.map', false);
            }
        }
    });
};
//map true时生成sourceMap，多加个参数，build时直接将css写到编译后的目录去
module.exports = function (map, package, type) {
    var inputPath = './src/sass/index.scss';
    var outputPath = './src/css/style.css';
    var outputStyle = 'compressed';
    var PIP = package.inputPath;
    if (PIP) {
        inputPath = './src/sass/' + PIP;
    }
    var POP = package.outputPath;
    if (POP) {
        outputPath = './src/css/' + POP;
    }
    if (package.outputStyle) {
        outputStyle = package.outputStyle;
    }
    var outputPath2 = outputPath.replace('src', package.dist);//打包后的目录
    outputPath2 = outputPath2.replace('//', '/');
    var auto = package.autoPreFixer;

    //支持多个入口
    var lenI = PIP.split(',');
    var lenU = POP.split(',');
    if (lenI.length > 1 && lenI.length == lenU.length) {
        for (var i = 0; i < lenI.length; i++) {
            inputPath = './src/sass/' + lenI[i];
            outputPath = './src/css/' + lenU[i];
            outputPath2 = outputPath.replace('src', package.dist);
            outputPath2 = outputPath2.replace('//', '/');
            sassNode(inputPath, outputStyle, outputPath, map, auto, type, outputPath2);
        }
    } else {
        sassNode(inputPath, outputStyle, outputPath, map, auto, type, outputPath2);
    }
};

function autoPreFixer(css, outPath, log, auto, type, map) {
    if (auto) {
        //编译后再将样式添加兼容前缀时会去掉map信息，watch时追加回去。（暂没找到配置办法）
        var sourceMap = '';
        if (type == 'watch' && map) {
            sourceMap = '/*# sourceMappingURL=' + outPath.replace('./src/css/', '') + '.map */';
        }
        postcss([autoprefixer]).process(css).then(function (result) {
            result.warnings().forEach(function (warn) {
                console.warn(warn.toString());
            });
            writeFiles(result.css + sourceMap, outPath, log)
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