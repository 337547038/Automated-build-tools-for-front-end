const fs = require("fs");
const sass = require("./sass");
module.exports = function (map, package, type) {
// 遍历sass目录
  let sassJson = [];
  let paths = fs.readdirSync('./src/sass');
  //查找当前目录下不以_开头的文件
  paths.forEach((name) => {
    if (name.indexOf('_') !== 0 && name.indexOf('.scss') !== -1) {
      let src = './src/sass/' + name;
      //先生成一次
      sass(map, src, package, type);
      // 提取文件里面的包含文件，即@import "public","main";
      const data = fs.readFileSync(src, {encoding: 'utf8'});
      let include = '';
      data.replace(/@import(.*);/gi, function (matchs, m1) {
        include = m1.replace(/ /g, '').replace(/"/g, '').replace(/'/g, '');
      });
      sassJson.push({file: name, include: include});
    }
  });
  //将提取的数据写入文件
  fs.writeFile("./src/sass/sass.json", JSON.stringify(sassJson, null, 4), function (err) {
    if (err) throw err;
  });
  return sassJson;
};
