## Extjs 6.2.0 Demo
Extjs 6.2.0  框架搭建，不使用打包工具
###BuildStep
######加载依赖
npm install
###### 启动
node server.js

## 说明
### 准本工作：
-  官方下载Extjs  sdk   （本示例版本为6.2.0）
        链接:http://pan.baidu.com/s/1eRV2UYI  密码:6tsy
- 安装node.js（省略安装步骤）

### 框架结构
![](http://images2017.cnblogs.com/blog/1225603/201709/1225603-20170929144819419-900427299.png)
![](http://images2017.cnblogs.com/blog/1225603/201709/1225603-20170929144821544-800888137.png)
1. 从extjs sdk 拷贝出框架需要的文件，将extjs build 中的js文件 放入框架lib/build 中
 ![](http://images2017.cnblogs.com/blog/1225603/201709/1225603-20170929144823715-960803077.png)
2.从extjs中取出主题文件放入lib/css中（注意选择一个自己喜欢的主题，将主题中 resoures 文件夹拷贝到 lib/css中）
![](http://images2017.cnblogs.com/blog/1225603/201709/1225603-20170929144825762-1900914094.png)
![](http://images2017.cnblogs.com/blog/1225603/201709/1225603-20170929144828465-705382015.png)
3.将chart（图表）有关的文件放入框架，因为extjs 的chart（图表）是单独的文件，所以自己项目需要的话，得单独引用。（从extjs sdk 中  build/packages/charts/classic  取出所需文件 放入框架中的build  和  css中）
![](http://images2017.cnblogs.com/blog/1225603/201709/1225603-20170929144829809-2133891215.png)
4.将extjs 扩招组件/插件  引入框架（因为不是常用，可以按需引用，减少文件体积。所以说框架中引入原始文件而不是build后的，将  sdk packages/ux/classic/src 放入框架ux中）
![](http://images2017.cnblogs.com/blog/1225603/201709/1225603-20170929144831747-856237698.png)
5.创建项目起始页index.html  放入框架根目录。以triton主题为例 依次引入theme-triton-all.css  ，ext-all.js  图表有关文件按自己的需求是否引用 
### 编写入口文件 app.js,配置extjs 组件\视图文件路径 并将app.js引入index.html
###### 在app.js中指定一些文件的路径，Extjs页面的起始页。还有一些Extjs 的全局配置也可以写在app.js中
       Ext.Loader.setPath({
           'myapp.ux': AppConfig.appUrl+'Content/ux',
            'Ext.ux': AppConfig.appUrl+'lib/ux',
            'Ext.draw.ContainerBase':AppConfig.appUrl+'lib/build/charts.js'
        });
	    Ext.setGlyphFontFamily('FontAwesome');
        Ext.application({
            name: AppConfig.appName,
            appFolder: AppConfig.appUrl + AppConfig.appName,
            enabled: true,
            requires: [
                'Ext.window.MessageBox',   
            ],
            autoCreateViewport: "webapp.view.main.Main"
        });
![](http://images2017.cnblogs.com/blog/1225603/201709/1225603-20170930104818278-1852560923.png)
###### app.js一般放在webapp 也就是你写页面层的根目录
![](http://images2017.cnblogs.com/blog/1225603/201709/1225603-20170930104824137-1395501372.png)
###### 全局配置
        var AppConfig={
                //项目根目录，物理路径
                appUrl:"./",
                //view页面路径
                appName:"webapp",
                //项目版本
                appVersion:"1.0.0",
        }
### 配置node服务器
###### package.json 配置如下
		{
		  "name": "extjs6.2.0demo",
		  "version": "1.0.0",
		  "description": "",
		  "main": "server.js",
		  "directories": {
			"lib": "lib"
		  },
		  "scripts": {
			"test": "echo \"Error: no test specified\" && exit 1",
			"start": "node server.js"
		  },
		  "dependencies": {
			"body-parser": "^1.18.1",
			"express": "^4.15.4"
		  },
		  "author": "status404",
		  "license": "ISC"
		}
###### serve.js  配置如下（使用express 模块 作为服务器）
![](http://images2017.cnblogs.com/blog/1225603/201709/1225603-20170930104836684-1795361829.png)
		var express = require('express');
		var app = express();
		var bodyParser = require('body-parser');

		// 创建 application/x-www-form-urlencoded 编码解析
		var urlencodedParser = bodyParser.urlencoded({ extended: false })

		app.use(express.static('./'));

		app.get('/index.html', function (req, res) {
		   res.sendFile( __dirname + "/index.html" );
		})

		app.post('/process_post', urlencodedParser, function (req, res) {

		   // 输出 JSON 格式
		   var response = {
			   "first_name":req.body.first_name,
			   "last_name":req.body.last_name
		   };
		   console.log(response);
		   res.end(JSON.stringify(response));
		})

		var server = app.listen(8081, function () {

		  var host = server.address().address
		  var port = server.address().port

		  console.log("应用实例，访问地址为 http://%s:%s", host, port)

		})
