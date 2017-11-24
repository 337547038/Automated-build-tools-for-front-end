var UglifyJS = require('uglify-js');
var fs = require('fs');
module.exports = function (filename, dist) {
    //if js名包含了.min则不处理
    if (filename.indexOf('.min') == -1) {
        var code = fs.readFileSync(filename, "utf8");
        var options = {
            ie8:true
        };
        var result = UglifyJS.minify(code, options);
        if (result.error) {
            throw result.error;
        }
        fs.writeFile(dist.replace('.js', '.min.js'), result.code, {
            encoding: 'utf8'
        })
    }
};