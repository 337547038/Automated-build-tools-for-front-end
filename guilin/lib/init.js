/**
 * 初始化创建目录
 * */
var package = require("../package.json");
var c = package.config;
var fs = require("fs");
var Init = function () {
    var data = {
        name: package.name,
        version: package.version,
        dist: c.dist,//打包后输出目录，默认为根目录
        port: c.port,
        serverIp:"",//服务器ip，开启服务时可以通过ip地址访问，否则只能使用localhost访问
        outputStyle: c.outputStyle,//sass输出类型,可选nested，expanded，compact，compressed(默认)
        autoPreFixer: c.autoPreFixer,//自动添加兼容后缀
        uglifyjs:c.uglifyjs,//压缩js
        mergeJs:"",//合并js,用+号连接，如a.js+b.js
        mergaJsName:"",//合并后的js输出文件名
        imgToBase64:c.imgToBase64,//将样式中的背景图片转为base64
        imgToBaseDel:c.imgToBaseDel,//转换后删除图片，如果多个样式引用同一个图片，删除图片会出错，此时建议设为false
        scripts: {
            "build": "guilin build",
            "watch": "guilin watch",
            "server": "guilin server",
            "imgTo64":"guilin imgToBase64"
        }
    };
    fs.writeFile("package.json", JSON.stringify(data, null, 4), function (err) {
        if (err) throw err;
    });
    //将一些静态资源复制到项目目录
    exists(__dirname.replace("lib","static"), './', copy );
    console.log('successful init');
};
var  stat = fs.stat;
var copy = function( src, dst ){
    // 读取目录中的所有文件/目录
    fs.readdir( src, function( err, paths ){
        if( err ){
            throw err;
        }
        paths.forEach(function( path ){
            var _src = src + '/' + path,
                _dst = dst + '/' + path,
                readable, writable;
            stat( _src, function( err, st ){
                if( err ){
                    throw err;
                }
                // 判断是否为文件
                if( st.isFile() ){
                    // 创建读取流
                    readable = fs.createReadStream( _src );
                    // 创建写入流
                    writable = fs.createWriteStream( _dst );
                    // 通过管道来传输流
                    readable.pipe( writable );
                }
                // 如果是目录则递归调用自身
                else if( st.isDirectory() ){
                    exists( _src, _dst, copy );
                }
            });
        });
    });
};
var exists = function( src, dst, callback ){
    fs.exists( dst, function( exists ){
        // 已存在
        if( exists ){
            callback( src, dst );
        }
        // 不存在
        else{
            fs.mkdir( dst, function(){
                callback( src, dst );
            });
        }
    });
};
module.exports = Init;
