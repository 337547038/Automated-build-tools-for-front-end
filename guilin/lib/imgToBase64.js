var fs = require('fs');
module.exports = function () {
    fs.readFile('./package.json', {encoding: 'utf8'}, function (err, package) {
        var jsonPackage = JSON.parse(package);
        if (jsonPackage.imgToBase64) {
            //遍历src/css/目录的css
            fs.readdir("./src/css/", function (err, files) {
                files.forEach(function (filename) {
                    var suffix = filename.substr(filename.length - 4, filename.length);
                    if (suffix == ".css") {
                        //if (filename.indexOf('.css') != -1) {
                        //如果是css文件
                        //这里处理输出路径
                        //var dist = "./" + package.dist + "/css/" + filename;
                        replaceUrl(filename, jsonPackage.dist, jsonPackage.imgToBaseDel);
                    }
                });
            });
        } else {
            console.log('请在package.json将imgToBase64设为true');
        }
    });
};
function replaceUrl(filename, dist, delImg) {
    var imgPathArray = [];
    fs.readFile('./src/css/' + filename, {encoding: 'utf8'}, function (err, result) {
        var dataReplace = result.replace(/url\((.+?)\)/gi, function (matchs, m1) {
            //检查图片存在
            //有些背景加了双引号的，这里去掉
            m1 = m1.replace(/"/g, "");
            var imgPath = "./" + dist + "/" + m1;//转换图片路径
            imgPath = imgPath.replace("../", "").replace(/\/\//g, "/");
            //console.log(imgPath);
            if (fs.existsSync(imgPath)) {
                var bData = fs.readFileSync(imgPath);
                if (bData.length / 1024 < 10) {//小于多少K
                    //取后缀，等于是取最后三位
                    var suffix = m1.substr(m1.length - 3, m1.length);
                    //var base64Str = bData.toString('base64');
                    //删除已转换的图片，先将图片保存保存，直接删除了多处使用同一图片时，后面会转换不成功
                    //fs.unlink(imgPath);
                    if (imgPathArray.indexOf(imgPath) == -1) {
                        imgPathArray.push(imgPath);
                    }
                    return 'url(data:image/' + suffix + ';base64,' + bData.toString('base64') + ')';
                }
                else {
                    return 'url(' + m1 + ')';
                }
            } else {
                return 'url(' + m1 + ')';
            }
        });
        var outPath = "./" + dist + "/css/" + filename;
        fs.writeFile(outPath, dataReplace, {
            encoding: 'utf8'
        }, function (err) {
            if (delImg) {
                //删除图片
                for (var i in imgPathArray) {
                    fs.unlink(imgPathArray[i],function (err) {});
                }
                console.log("image " + imgPathArray + " deleted successfully!");
            }
            console.log("imgToBase64 success!");
        });
    });
}
