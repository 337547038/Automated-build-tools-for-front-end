/**
 * Created by 337547038
 * 2019
 * https://github.com/337547038/Automated-build-tools-for-front-end
 */
const fs = require('fs');
const {createCanvas, loadImage, Image} = require('canvas');
let tempArray = []; // 所有图片信息
const spritesPath = './src/static/sprites';
/*const icons = spritesPath + '/icons';
const iconJson = spritesPath + '/icons.json';*/
let timer = 0;
const sprites = function () {
//module.exports = function (path) {
  if (fs.existsSync(spritesPath)) {
    // 目录时
    fs.readdir(spritesPath, function (err, paths) {
      if (err) {
        throw err
      }
      paths.forEach(function (src) {
        if (src.indexOf('.jpg') !== -1 || src.indexOf('.png') !== -1) {
          const img = new Image();
          img.onload = () => {
            tempArray.push({
              path: src,
              width: img.width,
              height: img.height
            });
          };
          img.src = spritesPath + '/' + src // 不支持带有中文名称
        }
      })
      writeFile(tempArray)
    })
  }
};


// 根据图片信息，计算并排列
function writeFile(tempArray) {
  // 对tempArray排序，将高度差不多的放一行，减少行与行的间距
  tempArray.sort(function (a, b) {
    if (a.height < b.height) {
      return -1;
    }
    if (a.height > b.height) {
      return 1;
    }
    return 0;
  });
  // 计算生成图的大小，宽固定为500
  let usedWidth = 0; // 当前列已使用宽度，换行时要回0
  let usedHeight = 0; // 当前使用高度
  let maxHeight = 0;// 当前行最大高度，换行时要回0
  const spacing = 5; // 两张图片间的间距
  let demoContent = '';
  let demoBeforeStyle = '.demo-before [class*="sprites-"]{line-height: 100%}\n.demo-before [class*="sprites-"]:before{content: \'\';background-image: url(../img/sprites.png); display: inline-block;vertical-align: middle;}\n';
  let demoPhoneStyle = '[class*="sprites-"]:before{content: \'\';background-image: url(../img/sprites.png); display: inline-block; vertical-align: middle;background-size: {{backgroundSize}}}\n';
  // 读取配置信息
  const config = JSON.parse(fs.readFileSync('./package.json'));
  const canvasWidth = config.spritesWidth;
  tempArray.forEach(item => {
    if (item.width + usedWidth + spacing > canvasWidth) {
      // 要换行
      usedHeight += maxHeight + spacing;
      usedWidth = 0;
      maxHeight = 0;
      // 如果xy没有时才重写
      item.x = item.x || 0;
    } else {
      item.x = item.x || usedWidth;
    }
    if (item.height > maxHeight) {
      maxHeight = item.height
    }
    item.y = item.y || usedHeight;
    usedWidth += item.width + spacing;
    const x = item.x ? `-${item.x}px` : 0;
    const y = item.y ? `-${item.y}px` : 0;
    // 写示例
    const className = `sprites-${item.path.replace('.jpg', '').replace('.png', '')}`;
    demoContent += `\r<li><i class="${className}"></i>${item.path}<span>background-position:${x} ${y}</span><span>${className}</span></li>`;
    const style = `{ background-position: ${x} ${y};width: ${item.width}px;height: ${item.height}px }`;
    demoBeforeStyle += `.demo-before .${className}:before${style}\r`;
    // 移动端的
    const xx = item.x ? `px(-${item.x})` : 0;
    const yy = item.y ? `px(-${item.y})` : 0;
    demoPhoneStyle += `.${className}:before{ background-position: ${xx} ${yy};width: px(${item.width});height: px(${item.height}) }\r`
  });
  const canvasHeight = usedHeight + maxHeight;
  // 读取sprites下的index.html，替换内容重写
  // const indexHtml = spritesPath + '/index.html';
  const indexHtml = __dirname.replace("lib", "static/src/static/sprites") + '/index.html';
  if (fs.existsSync(indexHtml)) {
    fs.readFile(indexHtml, {encoding: 'utf8'}, function (err, data) {
      // data = data.replace(/(?<=<span\sclass="total">)[\s\S]*?(?=<\/span>)/, hasList.length);
      // data = data.replace(/(?<=<ul\sclass="demo">)[\s\S]*?(?=<\/ul>)/, demoContent);
      // data = data.replace(/{{demoStyle}}/g, demoStyle);
      const demoBeforeStyle2 = demoBeforeStyle.replace(/.demo-before /g, '')
      const demoNormalStyle = demoBeforeStyle.replace(/demo-before/g, 'demo-normal').replace(/:before/g, '');
      const demoNormalStyle2 = demoBeforeStyle2.replace(/:before/g, '');
      demoPhoneStyle = demoPhoneStyle.replace(/{{backgroundSize}}/, `px(${canvasWidth}) px(${canvasHeight})`);
      data = data.replace(/{{total}}/, tempArray.length)
        .replace(/{{demoContent}}/g, demoContent)
        .replace(/{{demoBeforeStyle1}}/, demoBeforeStyle)
        .replace(/{{demoBeforeStyle2}}/, demoBeforeStyle2)
        .replace(/{{demoNormalStyle1}}/, demoNormalStyle)
        .replace(/{{demoNormalStyle2}}/, demoNormalStyle2)
        .replace(/{{demoPhoneStyle}}/, demoPhoneStyle);
      const outPath = spritesPath + '/index.html';
      fs.writeFile(outPath, data, function (err) {
        if (err) throw err;
        // 绿色
        console.log('\x1B[32m%s\x1B[39m', `成功写入Css Sprites示例${outPath}文件，请刷新查看`);
        // 复制到生成目录
        const dist = outPath.replace('./src', './' + config.dist)
        // 目录有可能不存在./build/static/sprites
        if (!fs.existsSync('./' + config.dist)) {
          fs.mkdirSync('./' + config.dist)
        }
        if (!fs.existsSync('./' + config.dist + '/static')) {
          fs.mkdirSync('./' + config.dist + '/static')
        }
        if (!fs.existsSync('./' + config.dist + '/static/sprites')) {
          fs.mkdirSync('./' + config.dist + '/static/sprites')
        }
        fs.createReadStream(outPath).pipe(fs.createWriteStream(dist))
      });
      // 生成一个css文件
      let beforeStyle = demoBeforeStyle2
      if (config.codeCheck.isMobile) {
        // 如果是移动应用端，则注释伪类引用，直接使用移动端
        beforeStyle = '/*伪类引用*/\n/*' + demoBeforeStyle2 + '*/\n'
      }
      let mobileStyle = demoPhoneStyle
      if (!config.codeCheck.isMobile) {
        // 如果是移动应用端，则注释伪类引用，直接使用移动端
        mobileStyle = '/*移动端*/\n/*' + demoPhoneStyle + '*/\n'
      }
      let cssData = beforeStyle + '\n/*常规引用css*/\n/*' + demoNormalStyle2 + '*/\n' + mobileStyle
      fs.writeFile('./src/sass/_sprites.scss', cssData, function (err) {
        if (err) throw err;
        // 绿色
        console.log('\x1B[32m%s\x1B[39m', `成功写入./src/sass/sprites.scss文件`);
      });
    })
  } else {
    console.log('\x1B[31m%s\x1B[39m', `写入示例失败，${indexHtml}文件不存在`)
  }
  // 将图片输出
  const canvas = createCanvas(canvasWidth, canvasHeight);
  const ctx = canvas.getContext('2d');
  drawImage(tempArray, ctx, canvas, config.dist)
}

function drawImage(imageList, ctx, canvas, configDist) {
  let len = imageList.length;
  imageList.forEach(item => {
    loadImage(spritesPath + '/' + item.path).then((image) => {
      ctx.drawImage(image, item.x, item.y, item.width, item.height);
      len--
      if (len === 0) {
        savePng(canvas, configDist)
      }
    }).catch(err => {
    })
  })

}

// 保存合并图片
function savePng(canvas, configDist) {
  const srcImage = './src/static/img';
  const pngName = '/sprites.png';
  const buildImage = srcImage.replace('src', configDist);
  const out = fs.createWriteStream(srcImage + pngName);
  const stream = canvas.createPNGStream();
  // 输出目录不存在时，先创建
  if (!fs.existsSync(srcImage)) {
    fs.mkdirSync(srcImage)
  }
  if (!fs.existsSync(buildImage)) {
    fs.mkdirSync(buildImage)
  }
  stream.pipe(out);
  stream.pipe(fs.createWriteStream(buildImage + pngName)); // 再复制到输出目录
  out.on('finish', () => console.log('The css sprites PNG file was created =>' + srcImage + pngName + ' and ' + buildImage + pngName))
}

module.exports = sprites;
