/**
 * Created by 337547038
 */
const fs = require('fs');
const {createCanvas, loadImage, Image} = require('canvas');
let total = 0; // 用于记录icons下图片的数量
let tempArray = []; // 临时保存当前新增加的
const spritesPath = './src/sprites';
const icons = spritesPath + '/icons';
const iconJson = spritesPath + '/icons.json';
let timer = 0;
const sprites = function (path) {
//module.exports = function (path) {
  if (fs.existsSync(spritesPath) && fs.existsSync(icons)) {
    let hasList = [];
    if (fs.existsSync(iconJson)) {
      try {
        hasList = JSON.parse(fs.readFileSync(iconJson));
      } catch (e) {
        hasList = []
      }
    }
    if (!path) {
      // 目录时
      fs.readdir(icons, function (err, paths) {
        if (err) {
          throw err
        }
        total = paths.length;
        paths.forEach(function (src) {
          total--;
          if (src.indexOf('.jpg') !== -1 || src.indexOf('.png') !== -1) {
            render(src, hasList)
          }
        })
      })
    } else {
      // 这参数为当前图片的文件名，如abc.png
      // render(path.replace(icons + '/', ''), hasList)
      // 在运行watch时每张图片会被调用一次，这里添加个延时判断，一定时间里连续请求时清空上一次，减少执行次数
      clearTimeout(timer);
      timer = setTimeout(() => {
        sprites()
      }, 1000)
    }
  }
};

// 遍历图片，提取每张图片的宽高信息，写入icons.json文件保存
function render(path, hasList) {
  let has = false;
  // 图片已经存在于json时，不处理
  hasList.forEach(item => {
    if (item.path === path) {
      has = true
    }
  });
  if (!has) {
    const img = new Image();
    img.onload = () => {
      tempArray.push({
        path: path,
        width: img.width,
        height: img.height
      });
      writeFile(hasList)
    };
    img.src = icons + '/' + path // 不支持带有中文名称
  } else {
    writeFile(hasList)
  }
}

// 根据图片信息，计算并排列
function writeFile(hasList) {
  // 目录时只写入一次
  if (total === 0) {
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
    // 合并两个数组
    hasList.push.apply(hasList, tempArray);
    // 计算生成图的大小，宽固定为500
    let usedWidth = 0; // 当前列已使用宽度，换行时要回0
    let usedHeight = 0; // 当前使用高度
    let maxHeight = 0;// 当前行最大高度，换行时要回0
    const spacing = 5; // 两张图片间的间距
    let demoContent = '';
    let demoStyle = '';
    // 读取配置信息
    const config = JSON.parse(fs.readFileSync('./package.json'));
    const canvasWidth = config.spritesWidth;
    hasList.forEach(item => {
      if (item.width + usedWidth + spacing > canvasWidth) {
        // 要换行
        usedHeight += maxHeight + spacing;
        usedWidth = 0;
        maxHeight = 0;
        // 如果xy没有时才重写
        item.x = item.x || 0;
      } else {
        item.x = item.x || usedWidth;
        if (item.height > maxHeight) {
          maxHeight = item.height
        }
      }
      item.y = item.y || usedHeight;
      usedWidth += item.width + spacing;
      const x = item.x ? `-${item.x}px` : 0;
      const y = item.y ? `-${item.y}px` : 0;
      // demoContent += `\r<li><i style="height: ${item.height}px;width: ${item.width}px;background-position:${x} ${y}"></i>${item.path}<span>background-position:${x} ${y}</span></li>`
      const className = `sprites-${item.path.replace('.jpg', '').replace('.png', '')}`;
      demoContent += `\r<li><i class="${className}"></i>${item.path}<span>background-position:${x} ${y}</span><span>${className}</span></li>`;
      demoStyle += `\r.${className}{ background-position: ${x} ${y};width: ${item.width}px;height: ${item.height}px }`;
    });
    // 读取sprites下的index.html，替换内容重写
    // const indexHtml = spritesPath + '/index.html';
    const indexHtml = __dirname.replace("lib", "static/src/sprites") + '/index.html';
    if (fs.existsSync(indexHtml)) {
      fs.readFile(indexHtml, {encoding: 'utf8'}, function (err, data) {
        /*const dataReplace = data.replace(/<ul\sclass="demo">([\s\S]*?)<\/ul>/g, function (matchs, m1) {
          console.log(m1)
          return demoContent
        });*/
        data = data.replace(/(?<=<span\sclass="total">)[\s\S]*?(?=<\/span>)/, hasList.length);
        data = data.replace(/(?<=<ul\sclass="demo">)[\s\S]*?(?=<\/ul>)/, demoContent);
        data = data.replace(/{{demoStyle}}/g, demoStyle);
        const outPath = spritesPath + '/index.html';
        fs.writeFile(outPath, data, function (err) {
          if (err) throw err;
          // 绿色
          console.log('\x1B[32m%s\x1B[39m', `成功写入Css Sprites示例${outPath}文件，请刷新查看`);
        });
      })
    } else {
      console.log('\x1B[31m%s\x1B[39m', `写入示例失败，${indexHtml}文件不存在`)
    }
    fs.writeFile(iconJson, JSON.stringify(hasList, null, 2), function (err) {
      if (err) throw err;
      console.log(`本次需合并的icon图片共${hasList.length}个,其中新增${tempArray.length}个`);
      // 清空
      tempArray = []
    });
    const canvasHeight = usedHeight + maxHeight;
    const canvas = createCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext('2d');
    drawImage(hasList, ctx, canvas, config.dist)
  }
}

function drawImage(imageList, ctx, canvas, configDist) {
  let len = imageList.length;
  imageList.forEach(item => {
    loadImage(icons + '/' + item.path).then((image) => {
      len--;
      ctx.drawImage(image, item.x, item.y, item.width, item.height);
      savePng(len, canvas, configDist)
    }).catch(err => {
      len--;
      savePng(len, canvas, configDist);
      // 添加带颜色输出，红色
      console.log('\x1B[33m%s\x1B[39m', `图片${icons}/${item.path}不存在`)
    })
  })
}

// 保存合并图片
function savePng(len, canvas, configDist) {
  if (len === 0) {
    const srcImage = './src/images';
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
}

module.exports = sprites;
