/**
 * Created by 337547038
 */
const UglifyJS = require('uglify-js');
const fs = require('fs');
/* 在当前目录下生成一个.min文件 */
module.exports = function (src, dist) {
  //if js名包含了.min则不处理
  const config = JSON.parse(fs.readFileSync('./package.json'));
  if (src.indexOf('.min') === -1 && config.uglifyjs) {
    const code = fs.readFileSync(src, "utf8");
    const options = {
      ie8: true
    };
    const result = UglifyJS.minify(code, options);
    if (result.error) {
      throw result.error;
    }
    fs.writeFile(src.replace('.js', '.min.js'), result.code, {
      encoding: 'utf8'
    }, function () {
      console.log(src + ' => ' + src.replace('.js', '.min.js'))
    })
  }
};
