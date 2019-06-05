/**
 * Created by 337547038
 * 2019
 * https://github.com/337547038/Automated-build-tools-for-front-end
 */
const puppeteer = require('puppeteer');
const fs = require("fs");
module.exports = async function (filename, callback) {
  const path = './src/model/';
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  const url = 'file:///' + process.cwd().replace(/\\/g, '/') + path + filename;
  // 取问号前的
  const file = filename.substr(0, filename.indexOf('?'));
  if (!fs.existsSync(path + file)) {
    // 不存在
    console.log('\x1B[33m%s\x1B[39m', '文件不存在:' + path + file);
    await browser.close();
    return
  }
  await page.goto(url);
  const dimensions = await page.evaluate(() => {
    if (document.getElementById('page')) {
      return document.getElementById('page').innerHTML
    } else {
      return null
    }
  });

  fs.writeFile('./src/model/cache/' + encodeURIComponent(filename), dimensions, {
    encoding: 'utf8'
  }, function () {
    console.log('./src/model/cache/' + filename);
    callback && callback();
  });
  // console.log('Dimensions:', dimensions);

  await browser.close();
};
