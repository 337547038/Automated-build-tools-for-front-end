/**
 * Created by 337547038
 */
const fs = require("fs");
const puppeteer = require("./puppeteer");
/* 创建模板缓存 在修改了model目录下的文件时*/
module.exports = function (src, type) {
  const copy = require('./copy');
  // 这里要排除cache目录的下文件
  if (src.indexOf('src/model/cache/') === -1) {
    // console.log(src);
    // 根据已生成的model/cache/cache.json生成对的缓存文件入所有引用的html文件
    const cachePath = './src/model/cache/cache.json';
    if (!fs.existsSync(cachePath)) {
      return // 不存在直接返回
    }
    const fileName = src.replace('./src/model/', '');
    const cache = JSON.parse(fs.readFileSync(cachePath));
    if (cache.length > 0) {
      let hasPath = []; // 已生成列表
      cache.forEach(item => {
        if (item.include.indexOf(fileName) !== -1) {
          // 减少重复生成缓存次数，同参数文件被多个页面引用时
          if (hasPath.indexOf(item.include) === -1) {
            hasPath.push(item.include);
            if (item.include.indexOf('?') !== -1) {
              // 包含有参数的，先生成
              puppeteer(item.include, copy.bind(this, item.src, item.dist, type))
            } else {
              // 没参数的，直接生成当前文件
              copy(item.src, item.dist, type)
            }
          } else {
            copy(item.src, item.dist, type)
          }
        }
      })
    }
  }
};
