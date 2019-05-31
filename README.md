# 前端自动化构建工具

一款基于Node.js的前端自动化构建工具，该工具集成了本地开发服务器，减少开发过程中不必要的重复工作，如批量查找替换公共部分；解决使用Ruby编译sass时中文路径报错，使用Koala有时不会自动编译等问题。

 - 内置webpack-dev-server服务器，支持实时监听文件，文件被修改时会自动编译，并刷新浏览器
 - 支持本地静态文件预览，内置本地开发调试服务器，以及当前目录浏览
 - sass预处理器，自动压缩优化css文件
 - 自动给css样式添加相应的浏览器前缀
 - 可设置自动生成base64编码，减小对服务器请求
 - 自动生成css精灵图，一键合并多张小图，并更新background-position属性值。减少在开发时使用PS等工具对图片进行排列，测量计算位置 
 - 使用uglifyjs对js混淆压缩 
 - 模块化开发，分离公共部分，实现如后端语言般将例如头部尾部公共部分分离
 - 动态加载html模块
 - html/js文件格式化
 - html/css代码质量检查
 
基于版本：
 - Node.js 10.7.0  
 - webpack-cli@3.1.0
 - webpack@4.16.3
 - webpack-dev-server@3.1.5
 

## 一、安装

首先需要安装node.js

1、全局安装webpack、webpack-cli、webpack-dev-server，如不需要自动刷新（即运行guilin server命令），这步可以省略。命令：
   - npm install -g webpack
   - npm install -g webpack-dev-server
   - npm install -g webpack-cli

2、将文件夹`guilin`复制到以下路径`C:\Users\当前用户名\AppData\Roaming\npm\node_modules`，
   然后进入`C:\Users\当前用户名\AppData\Roaming\npm\node_modules\guilin`目录，执行`npm install`命令安装依懒。

3、最重要的一点：将目录下的`guilin.cmd`复制到以下目录`C:\Users\当前用户名\AppData\Roaming\npm`，才能使用下面的所有命令。

   目录下包含了static文件夹，guilin init初始化时会将目录下的文件复制到当前项目目录，因此可以将一些常用的脚本样式图片等放到对应的目录去，初始化时就不用再次复制了。

   以上安装可参内容中的图片。

## 二、使用

   在适合的地方新建文件夹，例如my-project。然后在此目录下执行项目初始化命令：

   1、guilin init
   这条命令会在项目目录在创建基本目录结构：

    my-project
       -- build          打包发布后的目录
       --src            发开源文件目录
         --css
         --images
         --js
         --sass
         --model   存放公共模块，如header.html
         --sprites 需要合并的icon小图标放置目录
         --webpack webpack配置相关文件，如不需要自动刷新可删除
      -- package.json      项目配置信息

  2、guilin build
   简写为guilin b
   此命令可将src下的文件编译并复制到指定目录下如build。

   3、guilin server
   简写为 guilin s
   启动服务，执行后可在浏览器输入 http://localhost:8080 查看页面，修改了源文件会自动刷新页面。

   4、guilin watch
   简写为 guilin w
   开启监听命令，类似于server，不同的在于它不会启动http服务。
   
   5、guilin sprites
   简写为 guilin cs
   合并小图片命令，将指定目录下的所有小图片合并为sprites.png并精准计算其对应的background-position位置。
   
   6、guilin stylelint
      简写为 guilin sl
      scss样式代码质量检查
      
   7、guilin htmlhint
      简写为 guilin hl
      检查html代码质量 


## 三、配置说明

- 一般情况无需配置，用默认的即可。
- dist:'build' 编译生成目录，默认为空即为根目录test，如将文件打包到目录build，dist:”build”
- port:'8090' 启动服务时的端口
- serverIp:'' 用于访问的本机ip地址，开启server命令有效，不填写时只能通过 http://localhost 来访问。可为true(自动获取ip地址)或指定ip地址，以方便使用移动端访问调试
- outputStype:'compressed' sass输出类型,可选nested，expanded，compact，compressed(默认)
- autoPreFixer:true 添加css3兼容前缀，默认为true
- uglifyjs:false 压缩js，在当前js目录生成files.min.js，默认为false
- imgToBase64:false 将样式中的背景图片转为base64，默认为false
- imgLimit:10 图片转换base64最大值，大于此值不转换，单位k
- spritesWidth:500 小图合并后的sprites.png图的宽度
- lintExclude: ['model', 'font', 'sprites'] html代码检查时排除的目录

## 四、模块化开发

   对于一个页面，除自身的html模板，样式和脚本外，同时还包括如header，footer等公共的部分，要使用一个公共header，只需在页面引用模块html即可，
  如model下新建header.html。内容为：
```html
  <div class="header">这是公共头部</div>
```
在src下新建index.html，内容为：
```html
<body>
      <!-- include href="header.html" -->
      <p>这里是当前页面内容</p>
 </body>
```

   如果已经开启了server或是watch命令，此时build目录下会生成index.html文件，内容为：即已把头部内容包括进来了
   ```html
    <body>
       <div class="header">这里是公共头部</div>
       <p>这里是当前页面内容</p>
    </body>
```
   很多时候header.html也是需要针对不同的页面有一些小改变，例如菜单导航显示当前位置。加载动态时只需要传参数即可，然后在公共模板如header.html里接收参数，并作相应的处理，它需要一个url将参数传过去。引入动态模板如

    <!-- include href="header.html?a=1" -->

   然后在header.html里接收参数a。
   这里有个特殊的地方，因为是url访问，header.html需要一个完整的html页面结构，即包括html,head,body这些标签，否则访问到的有可能是乱码，因此带有参数访问时，只会返回header.html里面id=page”的内容，其它的不会被返回
   ```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>index</title>
</head>
<body id="page">
    <div class="header">header</div>
</body>
</html>
```

## 五、注意事项

   1、打包下载360会提示有木马，可能是因为使用了NodeJS的fs文件系统。因为要对文件进行复制粘贴修改等，请放心使用；

   2、使用过程有疑问请留言。

