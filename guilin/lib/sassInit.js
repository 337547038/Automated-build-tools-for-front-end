const fs = require("fs");
const sass = require("./sass");
let sassData = [];
module.exports = function (map, package, type, path) {
  // 如果path有值，即指定文件名时，处理当前文件
  sassData.splice(0, sassData.length);
  if (path !== '') {
    let index = path.lastIndexOf('/');
    let name = path.substr(index + 1);
    sassComm(path, package, map, type, name);
  } else {
    let paths = fs.readdirSync('./src/sass');
    //查找当前目录下不以_开头的文件
    paths.forEach((name) => {
      if (name.indexOf('_') !== 0 && name.indexOf('.scss') !== -1) {
        let src = './src/sass/' + name;
        sassComm(src, package, map, type, name);
      }
    });
    //将提取的数据写入文件
    /*fs.writeFile("./src/sass/sass.json", JSON.stringify(sassJson, null, 4), function (err) {
      if (err) throw err;
    });*/
  }

  function sassComm(src, package, map, type, name) {
    //先生成一次
    sass(map, src, package, type);
    // 提取文件里面的包含文件，即@import "public","main";
    const data = fs.readFileSync(src, {encoding: 'utf8'});
    let include = '';
    data.replace(/@import(.*);/gi, function (matchs, m1) {
      include = m1.replace(/ /g, '').replace(/"/g, '').replace(/'/g, '');
    });
    sassData.push({file: name, include: include});
  }

// 遍历sass目录
  return sassData;
};
