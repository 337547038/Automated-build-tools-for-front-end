var driver = require('node-phantom-simple');
var fs = require("fs");

module.exports = function (filename) {
    driver.create({path: require('phantomjs').path}, function (err, browser) {
        return browser.createPage(function (err, page) {
            //这里改为以本地方式打开，可以不用开服务
            //var url = 'http://localhost:' + port + '/src/model/' + filename;
            var url = 'file:///' + process.cwd().replace(/\\/g, '/') + "/src/model/" + filename;
            return page.open(encodeURI(url), function (err, status) {
                if (status == 'fail') {
                    console.log('404 error,' + filename + ' file does not exist');
                    //process.exit(0);
                } else {
                    setTimeout(function () {
                        return page.evaluate(function () {
                            return document.getElementById('page').innerHTML;
                        }, function (err, result) {
                            //console.log(result);
                            fs.writeFile('./src/model/cache/' + encodeURIComponent(filename), result, {
                                encoding: 'utf8'
                            }, function () {
                                console.log('./src/model/cache/' + filename);
                            });
                            browser.exit();
                        });
                    }, 100);
                }
            });
        });
    });
    var dist = './src/model/cache';
    fs.exists(dist, function (exists) {
        // 已存在
        if (exists) {
        }
        // 不存在
        else {
            fs.mkdir(dist, function () {
            });
        }
    });
};


