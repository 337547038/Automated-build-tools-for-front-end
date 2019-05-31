/**
 * Created by 337547038 html检查
 */
const fs = require('fs');
const HTMLHint = require("htmlhint");
// https://github.com/htmlhint/HTMLHint/wiki/Usage
let pass = true;
let timer = '';
const config = JSON.parse(fs.readFileSync('./package.json'));
const searchHtmlFiles = function (src) {
  if (!src) {
    src = './src'
  }
  fs.readdir(src, function (err, paths) {
    paths.forEach(function (path) {
      const newSrc = src + '/' + path;
      fs.stat(newSrc, function (err, st) {
        if (err) {
          throw err
        }
        if (st.isFile()) {
          if (newSrc.indexOf('.html') !== -1) {
            // console.log(newSrc)
            htmlFile(newSrc)
          }
        } else if (st.isDirectory()) {
          // const exclude = ['model', 'font','sprites'];
          const exclude = config.lintExclude;
          if (exclude.indexOf(path) === -1) {
            // console.log(path)
            searchHtmlFiles(newSrc);
          }
        }
      })
    })
  })
};

function htmlFile(src) {
  // https://github.com/htmlhint/HTMLHint/wiki/Rules
  const rules = {/*"inline-style-disabled": true*/};
  fs.readFile(src, {encoding: 'utf8'}, function (err, data) {
    const messages = HTMLHint.default.verify(data, rules);
    if (messages.length > 0) {
      pass = false;
      console.log('\x1B[33m%s\x1B[39m', src);
      console.log(messages)
    }
    clearTimeout(timer);
    if (pass) {
      timer = setTimeout(() => {
        console.log('检验通过')
      }, 2000)
    }
  })
}

module.exports = searchHtmlFiles;
