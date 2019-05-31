const puppeteer = require('puppeteer');
const fs = require("fs");
module.exports = async function (filename, callback) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  const url = 'file:///' + process.cwd().replace(/\\/g, '/') + "/src/model/" + filename;
  await page.goto(url);

  const dimensions = await page.evaluate(() => {
    return document.getElementById('page').innerHTML
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
