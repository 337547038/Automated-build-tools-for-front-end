/**
 * Created by 337547038
 * 2019
 * https://github.com/337547038/Automated-build-tools-for-front-end
 */
const fs = require('fs');
const htmlhint = require("htmlhint");
// https://github.com/htmlhint/HTMLHint/wiki/Usage
const puppeteer = require('puppeteer');
const iPhone = puppeteer.devices['iPhone 8'];
let pass = true;
let timer = '';
let config = {};
let tempHtml = [];

const searchHtmlFiles = async function () {
  // const stratTime = new Date()
  console.time('usedTime');
  config = JSON.parse(fs.readFileSync('./package.json'));
  console.log(`Check path ./${config.dist}, Please wait...`);
  searchHtml(config.dist);
  if (config.codeCheck.screenshots) {
    console.log('Saving screenshots...');
    const savePath = config.dist + '/screenshots';
    if (!fs.existsSync(savePath)) {
      fs.mkdirSync(savePath)
    }
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    if (config.codeCheck.isMobile) {
      // 模拟手机
      page.setViewport({
        width: 750,
        height: 1366
      })
      await page.emulate(iPhone);
    } else {
      page.setViewport({
        width: 1920,
        height: 720
      })
    }
    const path = 'file:///' + process.cwd().replace(/\\/g, '/');
    // 遍历tempHtml，对所有页面拍照
    for (let i = 0; i < tempHtml.length; i++) {
      const item = tempHtml[i];
      const url = path + '/' + item;
      const imgPath = savePath + '/' + item.replace(config.dist + "/", '').replace(/\//g, '-').replace('.html', '.png')
      await page.goto(url);
      await page.screenshot({
        path: imgPath,
        // type: 'jpeg',
        fullPage: true
      });
      console.log(imgPath)
    }
    await browser.close();
    console.timeEnd('usedTime');
    // console.log(new Date() - stratTime)
  }
};

/*同步递归遍历，提取所有html文件*/
function searchHtml(src) {
  fs.readdirSync(src).forEach(item => {
    const newSrc = src + '/' + item;
    const stat = fs.statSync(newSrc);
    if (stat.isFile()) {
      if (newSrc.indexOf('.html') !== -1) {
        tempHtml.push(newSrc);
        // 代码检查
        htmlFile(newSrc)
      }
    } else if (stat.isDirectory()) {
      const exclude = config.codeCheck.lintExclude;
      if (exclude.indexOf(item) === -1) {
        searchHtml(newSrc);
      }
    }
  })
}

function htmlFile(src) {
  // https://github.com/htmlhint/HTMLHint/wiki/Rules
  const rules = {/*"inline-style-disabled": true*/};
  fs.readFile(src, {encoding: 'utf8'}, function (err, data) {
    const messages = htmlhint.default.verify(data, rules);
    if (messages.length > 0) {
      pass = false;
      console.log('\x1B[33m%s\x1B[39m', src);
      console.log(messages)
    }
    clearTimeout(timer);
    if (pass) {
      timer = setTimeout(() => {
        console.log('HtmlCode check passed.')
      }, 2000)
    }
  })
}

module.exports = searchHtmlFiles;
