const puppeteer = require('puppeteer');
var fs = require("fs");
module.exports = async function (filename) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  var url = 'file:///' + process.cwd().replace(/\\/g, '/') + "/src/model/" + filename;
  await page.goto(url);

  const dimensions = await page.evaluate(() => {
    return document.getElementById('page').innerHTML
  });

  fs.writeFile('./src/model/cache/' + encodeURIComponent(filename), dimensions, {
    encoding: 'utf8'
  }, function () {
    console.log('./src/model/cache/' + filename);
  });

  // console.log('Dimensions:', dimensions);

  await browser.close();
}
