## webpack原理

`webpack`是一个用于JavaScript应用程序的静态模块化打包工具，它可以通过入口文件分析项目依赖，找到JavaScript模块及其他不能直接被浏览器执行的语言模块（如Less、ES6、TypeScript），将其转换打包为浏览器可运行的模块。

#### 基本概念

webpack主要是由以下几个概念模块构成：

- `Entry`：入口，Webpack 执行构建的第一步将从 Entry 开始，通常为配置项的`entry`字段。
- `Module`：模块，一个模块对应着一个文件。webpack 会从配置的 `entry`入口出递归分析出所有依赖的模块。
- `Chunk`：代码块，一个 Chunk 由多个模块组合而成，用于公共代码合并与分割，合理拆分文件大小。
- `Loader`：模块转换器，对原文件内容按照自定义配置项转换成新的直接使用的内容。
- `Plugin`：扩展插件，在 webpack 构建流程中的特定时机会监听对应的事件，在监听时做一些对资源的再次处理。

#### 构建流程

webpack 的运行流程是一个串行的过程，遵循`初始化参数-->输入资源-->分析依赖-->编译模块 -->输出资源`，从启动到结束主要会依次执行以下流程：

1、`初始化参数`：从配置文件和 Shell 语句中读取与合并参数，得出最终的参数；

2、`开始编译`：用上一步得到的参数初始化 Compiler 对象，加载所有配置的插件，执行对象的 run 方法开始执行编译；

3、`确定入口`：根据配置中的 entry 找出所有的入口文件；

4、`编译模块`：从入口文件出发，调用所有配置的 Loader 对模块进行翻译，再找出该模块依赖的模块，再递归本步骤直到所有入口依赖的文件都经过了本步骤的处理；

5、`完成模块编译`：在经过第 4 步使用 Loader 翻译完所有模块后，得到了每个模块被翻译后的最终内容以及它们之间的依赖关系；

6、`输出资源`：根据入口和模块之间的依赖关系，组装成一个个包含多个模块的 Chunk，再把每个 Chunk 转换成一个单独的文件加入到输出列表，这步是可以修改输出内容的最后机会；

7、`输出完成`：在确定好输出内容后，根据配置确定输出的路径和文件名，把文件内容写入到文件系统。

构建流程可以分为以下三大阶段 ,概括如下：

- `初始化`：启动构建，读取与合并配置参数，加载 `Plugin`，实例化 `Compiler`。
- `编译`：从 `Entry` 发出，针对每个 `Module` 串行调用对应的 `Loader` 去翻译文件内容，再找到该  `Module`  依赖的  `Module`，递归地进行编译处理。
- `输出`：对编译后的 `Module` 组合成 `Chunk`，把  `Chunk`  转换成文件，输出到本地。

> 实现这一切的核心就是发布订阅[Tapable](https://github.com/webpack/tapable)

#### Hook事件

##### 初始化阶段

* `初始化参数`: 从配置文件和 Shell 语句中读取与合并参数，得出最终的参数。 这个过程中还会执行配置文件中的插件实例化语句 new Plugin()。  

* `实例化 Compiler`: 用上一步得到的参数初始化 Compiler 实例，Compiler 负责文件监听和启动编译。Compiler 实例中包含了完整的 webpack 配置，全局只有一个 Compiler 实例。  

* `加载插件`: 依次调用插件的 apply 方法，让插件可以监听后续的所有事件节点。同时给插件传入 compiler 实例的引用，以方便插件通过 compiler 调用 webpack 提供的 API。  

* `environment`:  开始应用 Node.js 风格的文件系统到 compiler 对象，以方便后续的文件寻找和读取。  

* `entry-option`:  读取配置的 Entrys，为每个 Entry 实例化一个对应的 EntryPlugin，为后面该 Entry 的递归解析工作做准备。  

* `after-plugins`:  调用完所有内置的和配置的插件的 apply 方法。  

* `after-resolvers`  根据配置初始化完 resolver，resolver 负责在文件系统中寻找指定路径的文件。

##### 编译阶段

* `run`: 启动一次新的编译。  

* `watch-run`: 和 run 类似，区别在于它是在监听模式下启动的编译，在这个事件中可以获取到是哪些文件发生了变化导致重新启动一次新的编译。  

* `compile`: 该事件是为了告诉插件一次新的编译将要启动，同时会给插件带上 compiler 对象。  

* `compilation`: 当 webpack 以开发模式运行时，每当检测到文件变化，一次新的 Compilation 将被创建。一个 Compilation 对象包含了当前的模块资源、编译生成资源、变化的文件等。Compilation 对象也提供了很多事件回调供插件做扩展。  

* `make`: 一个新的 Compilation 创建完毕，即将从 Entry 开始读取文件，根据文件类型和配置的 Loader 对文件进行编译，编译完后再找出该文件依赖的文件，递归的编译和解析。  

* `after-compile`:  一次 Compilation 执行完成。  

* `invalid`:  当遇到文件不存在、文件编译错误等异常时会触发该事件，该事件不会导致 webpack 退出。

> 在编译阶段中，最重要的要数 compilation 事件了，因为在 compilation 阶段调用了 Loader 完成了每个模块的转换操作，在 compilation 阶段又包括很多小的事件，它们分别是：

* `build-module`:  使用对应的 Loader 去转换一个模块。  

* `normal-module-loader`:  在用 Loader 对一个模块转换完后，使用 acorn 解析转换后的内容，输出对应的抽象语法树（AST），以方便 webpack 后面对代码的分析
* `program`  从配置的入口模块开始，分析其 AST，当遇到 require 等导入其它模块语句时，便将其加入到依赖的模块列表，同时对新找出的依赖模块递归分析，最终搞清所有模块的依赖关系。  
* `seal`:  所有模块及其依赖的模块都通过 Loader 转换完成后，根据依赖关系开始生成 Chunk。

##### 输出阶段

* `should-emit`  所有需要输出的文件已经生成好，询问插件哪些文件需要输出，哪些不需要。  
* `emit`:  确定好要输出哪些文件后，执行文件输出，可以在这里获取和修改输出内容。  
* `after-emit`  文件输出完毕。  
* `done`  成功完成一次完成的编译和输出流程。  
* `failed`  如果在编译和输出流程中遇到异常导致 webpack 退出时，就会直接跳转到本步骤，插件可以在本事件中获取到具体的错误原因。

## Loader/Plugin

#### 基础概念


* `Loader`：loader是文件加载器，能够加载资源文件，并对这些文件进行一些处理，诸如编译、压缩等，最终一起打包到指定的文件中
  1. 处理一个文件可以使用多个loader，loader的执行顺序和配置中的顺序是相反的，即最后一个loader最先执行，第一个loader最后执行
  2. 第一个执行的loader接收源文件内容作为参数，其它loader接收前一个执行的loader的返回值作为参数，最后执行的loader会返回此模块的JavaScript源码
* `Plugin`：在webpack运行的生命周期中会广播出许多事件，plugin可以监听这些事件，在合适的时机通过webpack提供的API改变输出结果

#### loader、plugin区别

`loader`：用于对模块源码的转换，如将A文件进行编译形成B文件，这里操作的是文件，比如将A.less转换为A.css，单纯的文件转换过程，总结就是loader的作用是让webpack拥有了加载和解析非JavaScript、css等文件的能力。

`plugin`：是一个扩展器，它丰富了webpack本身，针对是loader结束后，webpack打包的整个过程，它并不直接操作文件，而是基于事件机制工作，会监听webpack打包过程中的某些节点，执行广泛的任务。

#### 常用 Loader

- `raw-loader`：加载文件原始内容（utf-8）
- `file-loader`：把文件输出到一个文件夹中，在代码中通过相对 URL 去引用输出的文件 (处理图片和字体)
- `url-loader`：与 file-loader 类似，区别是用户可以设置一个阈值，大于阈值时返回其 publicPath，小于阈值时返回文件 base64 形式编码 (处理图片和字体)
- `source-map-loader`：加载额外的 Source Map 文件，以方便断点调试
- `svg-inline-loader`：将压缩后的 SVG 内容注入代码中
- `image-loader`：加载并且压缩图片文件
- `json-loader` 加载 JSON 文件（默认包含）
- `handlebars-loader`: 将 Handlebars 模版编译成函数并返回
- `babel-loader`：把 ES6 转换成 ES5
- `ts-loader`: 将 TypeScript 转换成 JavaScript
- `awesome-typescript-loader`：将 TypeScript 转换成 JavaScript，性能优于 ts-loader
- `sass-loader`：将SCSS/SASS代码转换成CSS
- `css-loader`：加载 CSS，支持模块化、压缩、文件导入等特性
- `style-loader`：把 CSS 代码注入到 JavaScript 中，通过 DOM 操作去加载 CSS
- `postcss-loader`：扩展 CSS 语法，使用下一代 CSS，可以配合 autoprefixer 插件自动补齐 CSS3 前缀
- `eslint-loader`：通过 ESLint 检查 JavaScript 代码
- `tslint-loader`：通过 TSLint检查 TypeScript 代码
- `mocha-loader`：加载 Mocha 测试用例的代码
- `coverjs-loader`：计算测试的覆盖率
- `vue-loader`：加载 Vue.js 单文件组件
- `i18n-loader`: 国际化
- `cache-loader`: 可以在一些性能开销较大的 Loader 之前添加，目的是将结果缓存到磁盘里

#### 常用 Plugin

- `speed-measure-webpack-plugin`：检测打包过程中各个模块花费的时间
- `mini-css-extract-plugin`： 样式进行模块化拆分，可以实现异步加载
- `terser-webpack-plugin`: 支持压缩 ES6
- `webpack-parallel-uglify-plugin`: 多进程执行代码压缩，提升构建速度
- `webpack-dashboard`：可以更友好的展示相关打包信息。
- `ModuleConcatenationPlugin`: 开启 Scope Hoisting
- `speed-measure-webpack-plugin`: 可以看到每个 Loader 和 Plugin 执行耗时 (整个打包耗时、每个 Plugin 和 Loader 耗时)
- `webpack-bundle-analyzer`: 可视化 Webpack 输出文件的体积 (业务组件、依赖第三方模块)
- `extract-text-webpack-plugin`： 将样式抽离成一个 css，在 html 里插入 link 引入 webpack 3 以下使用
- `optimize-css-assets-webpack-plugin`：压缩 css
- `webpack.HotModuleReplacementPlugin`：热加载，修改代码后不用刷新页面
- `html-webpack-plugin`：编译后的文件（css/js）插入到入口文件中、指定文件插入、html 压缩
- `webpack.BannerPlugin`：可以在每次编译时给文件添加一些说明，比如版本号，作者、日期等
- `copy-webpack-plugin`：编译后拷贝文件到指定位置
- `webpack.DllPlugin`：抽离出第三方不会改动的库文件，如 react 等，防止每次编译耗时且文件过大
- `webpack-merge`： 合并 webpack 配置文件
- `progress-bar-webpack-plugin`： 编译时进度显示
- `webpack-dev-server`： webpack 开发模式服务，启动 node 服务，可以实现代理，刷新等功能，与`react-hot-loader`配合实现修改代码刷新
- `webpack-hot-middleware`：用来进行页面的热重载的,刷新浏览器 一般和 `webpack-dev-middleware` 配合使用，实现热加载功能

#### Loader 开发

``` js
const loaderUtils = require('loader-utils');
module.exports = function (source) {
  const option = loaderUtils.getOptions(this);
  return source.replace('hello word', option.name);
};
```



#### Plugin 开发

```js
const PluginName = 'PluginDemo'

class PluginDemo {
  apply(compiler) {
    compiler.hooks.afterCompile.tap(PluginName, () => {
      console.log(`PluginName处理开始`)
    })
    compiler.hooks.done.tap(PluginName, () => {
      console.log(`${PluginName}处理完成`)
    })
    compiler.hooks.compilation.tap(PluginName, (compilation) => {
       compilation.hooks[optimize].tap(PluginName, () => {
         console.log(`${PluginName}处理压缩中`)
        })
    })
  }
}

module.exports = PluginDemo
```



## 热更新原理

`HMR` 即 `Hot Module Replacement` 是指当你对代码修改并保存后，webpack 将会对代码进行重新打包，并将改动的模块发送到浏览器端，浏览器用新的模块替换掉旧的模块，去实现局部更新页面而非整体刷新页面

原理：

- Server 端使用`webpack-dev-server`去启动本地服务，内部实现主要使用了`webpack`、`express`、`websocket`。
- 使用`express`启动本地服务，当浏览器访问资源时对此做响应。
- 服务端和客户端使用`websocket`实现长连接
- webpack 监听源文件的变化，即当开发者保存文件时触发 webpack 的重新编译，编译完成后，发布`done`事件。
  - 每次编译都会生成 hash 值、已改动模块的 json 文件、已改动模块代码的 js 文件
  - 编译完成后通过 socket 向客户端推送当前编译的 hash 戳
- 客户端的 `websocket` 监听到有文件改动推送过来的 hash 戳，会和上一次对比
  - 一致则走缓存
  - 不一致则通过 `ajax` 和 `jsonp` 向服务端获取最新资源。`manifest.json`记录了所有发生变动的模块
- 使用内存文件系统去替换有修改的内容实现局部刷新

[参考：彻底搞懂并实现webpack热更新原理](https://segmentfault.com/a/1190000020310371)

## Tree Shaking

`tree-shaking` 作为 rollup 的一个杀手级特性，能够利用 **ES6 modules** 的静态分析引入规范，减少包的体积，避免不必要的代码引入。

#### 开启方式

- 1、处于生产模式。Webpack 只有在压缩代码的时候会 tree-shaking，而这只会发生在生产模式中。
- 2、将优化选项 “optimization.usedExports” 设置为 true。这意味着 webpack 将识别出它认为没有被使用的代码，并在最初的打包步骤中给它做标记。
- 3、你需要使用一个支持删除"死代码"的压缩器。这种压缩器将识别出 webpack 是如何标记它认为没有被使用的代码，并将其剥离。`TerserPlugin` 支持这个功能，推荐使用

对于单独引入的文件，默认是不 tree-shaking 的,这种文件被 webpack 定义为有副作用，如

```js
import("./a.js");
import("./a.less");
```

但是可以通过配置告诉 webpack 这种文件也是需要 tree shaking ，`package.json` 有一个特殊的属性 `sideEffects`，就是为此而存在的。它有三个可能的值：

- `true` 是默认值，如果不指定其他值的话。这意味着所有的文件都有副作用，也就是没有一个文件可以 tree-shaking。
- `false` 告诉 webpack 没有文件有副作用，所有文件都可以 tree-shaking。
- 第三个值 […] 是文件路径数组。它告诉 webpack，除了数组中包含的文件外，你的任何文件都没有副作用。因此，除了指定的文件之外，其他文件都可以安全地进行 tree-shaking。

##### 全局 css

上面的那种情况会将全局的 css\less 等文件也优化掉了，这样会导致样式失败，webpack 提供了对单种样式进行配置处理

```js
module: {
  rules: [
    {
      test: /regex/,
      use: [loaders],
      sideEffects: true
    }
  ];
}
```

#### tree-shaking 失败的原因

**必然要保证引用的模块都是 ES6 规范的，不支持使用 commonjs 模块来完成 tree-shaking**

通过配置 babel 不转换为 commonjs，把 modules 设置为 false，就是告诉 babel 不要编译模块代码。这会让 babel 保留我们现有的 es2015 `import/export` 语句

```js
presets: [
  [
    "[@babel/preset-env]",
    {
      modules: false
    }
  ]
];
```

## Scope Hosting

Scope Hoisting 可以让 Webpack 打包出来的代码文件更小、运行的更快， 它又译作 "作用域提升"，是在 Webpack3 中新推出的功能。

实现是将所有模块的代码按照引用顺序放在一个函数作用域里，然后适当的重命名一些变量以防止变量名冲突。

为了在 Webpack 中使用这个功能，你的代码必须是用 ES2015 的模块语法写的。当在不同的文件里多次 import 同一文件，则这个效果无效。

优点：

- 代码体积更小，因为函数声明语句会产生大量代码
- 代码在运行时因为创建的函数作用域更少了，内存开销也随之变小

在配置文件中添加一个新的插件，就可以实现 scope hosting 功能。

```js
module.exports = {
  plugins: [new webpack.optimize.ModuleConcatenationPlugin()]
};
```

## import()原理

举例

```js
import("./hello.js").then(result => {
  alert(result.default);
});
```

编译后生成：

```js
__webpack_require__
  .e("src_hello_js.js")
  .then(__webpack_require__.t.bind(__webpack_require__, "./src/hello.js"))
  .then(result => {
    alert(result.default);
  });
```

import 编译后的代码是个返回 primise 的 jsonp 函数

```js
__webpack_require__.e = function(chunkId) {
  return new Promise((resovle, reject) => {
    installedChunks[chunkId] = resovle;
    let script = document.createElement("script");
    script.src = chunkId;
    document.body.appendChild(script);
  }).catch(error => {
    alert("异步加载失败");
  });
};
```

该方法主要功能就是根据传入的`chunkId`使用`jsonp`去拉取对应的模块代码。这里它返回了一个`promise`，并将`resolve`放到了全局`installedChunks`对象上。因为这里不能确定`jsonp`什么时候成功，所以无法调用`resolve`，只能将它挂载到全局变量中。

那什么时候能确定`jsonp`成功了呢，答案是在`jsonp`的回调函数里可以确定，也就是下面的`webpackJsonp`方法里。

jsonp 拉回的代码：

```js
window.webpackJsonp("src_hello_js.js", {
  "./src/hello.js": function(module, exports, __webpack_require__) {
    module.exports = "hello";
  }
});
```

`window.webpackJsonp`代码：

```js
window.webpackJsonp = (chunkId, moreModules) => {
  for (moduleId in moreModules) {
    modules[moduleId] = moreModules[moduleId];
  }
  installedChunks[chunkId](); //resolve()
  installedChunks[chunkId] = 0;
};
```

`webpackJsonp` 主要工作就是将拉取回来的模块一一挂载到全局的 `modules` 对象中。并且改变对应的 `promise` 状态，也即是执行事先放在全局变量中的 `resolve` 方法，这样就会执行之后的 `then` 方法了。

`__webpack_require__.t`方法模拟导出 es module 代码如下：

```js
__webpack_require__.t = function(value) {
  value = __webpack_require__(value);
  return {
    default: value
  };
};
```



## Source Map

一般`sourceMap`包括以下内容

js

```js
{
  "version": 3,
  "sources": [
    "webpack:///webpack/bootstrap",
    "webpack:///./index.js"
  ],
  "names": ["installedModules","__webpack_require__","moduleId","exports","module",...],
  "mappings": "aACE,IAAIA,EAAmB,GAGvB,SAASC,EAAoBC,..."
  "file": "app.js",
  "sourcesContent": [],
  "sourceRoot": ""
}
```

- `version`：sourceMap版本号
- `sources`: 转换前源文件
- `names`:变量数组，存放转换前的变量名和属性名
- `mappings`: 计算源代码对应位置的规则
- `file`:转换后的文件名
- `sourcesContent`:源文件的内容
- `sourceRoot`:转换前文件目录

其中最主要的就是`mappings`,通过这个规则可以定位到转换前后代码的映射信息，mappings分为三层

- 第一层是**行对应**，以分号（;）表示，每个分号对应转换后源码的一行。所以，第一个分号前的内容，就对应源码的第一行，以此类推。
- 第二层是**位置对应**，以逗号（,）表示，每个逗号对应转换后源码的一个位置。所以，第一个逗号前的内容，就对应该行源码的第一个位置，以此类推。
- 第三层是**位置转换**，以[VLQ编码](http://en.wikipedia.org/wiki/Variable-length_quantity)表示，代表该位置对应的转换前的源码位置。

比如`aACE,IAAIA,EAAmB;SAASC`表示有两行，第一行3个位置，第二行1个位置

位置信息规则如下，基数从0开始

> 第一位，表示这个位置在（转换后的代码的）的第几列。
>
> 第二位，表示这个位置属于sources属性中的哪一个文件。
>
> 第三位，表示这个位置属于转换前代码的第几行。
>
> 第四位，表示这个位置属于转换前代码的第几列。
>
> 第五位，表示这个位置属于names属性中的哪一个变量。

参考：[阮一峰：mappings属性规则](http://www.ruanyifeng.com/blog/2013/01/javascript_source_map.html)

以下是webpack的devtool配置项

| devtool                                  | build   | rebuild | production | quality                       |
| :--------------------------------------- | :------ | :------ | :--------- | :---------------------------- |
| (none)                                   | fastest | fastest | yes        | bundled code                  |
| eval                                     | fastest | fastest | no         | generated code                |
| eval-cheap-source-map                    | fast    | faster  | no         | transformed code (lines only) |
| eval-cheap-module-source-map             | slow    | faster  | no         | original source (lines only)  |
| eval-source-map                          | slowest | fast    | no         | original source               |
| eval-nosources-source-map                |         |         |            |                               |
| eval-nosources-cheap-source-map          |         |         |            |                               |
| eval-nosources-cheap-module-source-map   |         |         |            |                               |
| cheap-source-map                         | fast    | slow    | yes        | transformed code (lines only) |
| cheap-module-source-map                  | slow    | slower  | yes        | original source (lines only)  |
| inline-cheap-source-map                  | fast    | slow    | no         | transformed code (lines only) |
| inline-cheap-module-source-map           | slow    | slower  | no         | original source (lines only)  |
| inline-source-map                        | slowest | slowest | no         | original source               |
| inline-nosources-source-map              |         |         |            |                               |
| inline-nosources-cheap-source-map        |         |         |            |                               |
| inline-nosources-cheap-module-source-map |         |         |            |                               |
| source-map                               | slowest | slowest | yes        | original source               |
| hidden-source-map                        | slowest | slowest | yes        | original source               |
| hidden-nosources-source-map              |         |         |            |                               |
| hidden-nosources-cheap-source-map        |         |         |            |                               |
| hidden-nosources-cheap-module-source-map |         |         |            |                               |
| hidden-cheap-source-map                  |         |         |            |                               |
| hidden-cheap-module-source-map           |         |         |            |                               |
| nosources-source-map                     | slowest | slowest | yes        | without source content        |
| nosources-cheap-source-map               |         |         |            |                               |
| nosources-cheap-module-source-map        |         |         |            |                               |

其中主要分为`eval`、`cheap`、`inline`、 `hidden`、`nosources`等组合，**带上`-source-map`标志的才会有 sourceMap 信息或文件生成**

#### eval模式

转换后每个模块都有eval包裹执行，不生成独立的 .map 文件，在混淆后代码中 sourceMappingURL 为 map 信息的 base64 编码

js

```js
    "use strict";
    eval(
      '__webpack_require__.r(__webpack_exports__);\n/* harmony default export */ __webpack_exports__["default"] = (() => {\n  console.log("hello world");\n});\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9pbmRleC5qcz80MWY1Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQWU7QUFDZjtBQUNBLENBQUMsRUFBQyIsImZpbGUiOiIwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGRlZmF1bHQgKCkgPT4ge1xuICBjb25zb2xlLmxvZyhcImhlbGxvIHdvcmxkXCIpO1xufTtcbiJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///0\n'
    );
```

#### inline模式

不生成单独的 map 文件，在混淆后的代码中 map 信息以单独的一行展示 base64 编码

js

```js
!function(e){var t={};function r(n){if(t[n])}}...
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vL2FwcC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIhZnVuY3Rpb24oZSl7dmFyIHQ9e307ZnVuY3Rpb24gcihuKXtpZih0W25dKXJldHVybiB0W25dLmV4cG9ydHM7dmFyIG89dFtuXT17aTpuLGw6ITEsZXhwb3J0czp7fX07cmV0dXJuIGVbbl0uY2FsbChvLmV4cG9ydHMsbyxvLmV4cG9ydHMsciksby5sPSEwLG8uZXhwb3J0c31yLm09ZSxyLmM9dCxyLmQ9ZnVuY3Rpb24oZSx0LG4pe3IubyhlLHQpfHxPYmplY3QuZGVmaW5lUHJvcGVydHkoZSx0LHtlbnVtZXJhYmxlOiEwLGdldDpufSl9LHIucj1mdW5jdGlvbihlKXtcInVuZGVmaW5lZFwiIT10eXBlb2YgU3ltYm9sJiZTeW1ib2wudG9TdHJpbmdUYWcmJk9iamVjdC5kZWZpbmVQcm9wZXJ0eShlLFN5bWJvbC50b1N0cmluZ1RhZyx7dmFsdWU6XCJNb2R1bGVcIn0pLE9iamVjdC5kZWZpbmVQcm9wZXJ0eShlLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pfSxyLnQ9ZnVuY3Rpb24oZSx0KXtpZigxJnQmJihlPXIoZSkpLDgmdClyZXR1cm4gZTtpZig0JnQmJlwib2JqZWN0XCI9PXR5cGVvZiBlJiZlJiZlLl9fZXNNb2R1bGUpcmV0dXJuIGU7dmFyIG49T2JqZWN0LmNyZWF0ZShudWxsKTtpZihyLnIobiksT2JqZWN0LmRlZmluZVByb3BlcnR5KG4sXCJkZWZhdWx0XCIse2VudW1lcmFibGU6ITAsdmFsdWU6ZX0pLDImdCYmXCJzdHJpbmdcIiE9dHlwZW9mIGUpZm9yKHZhciBvIGluIGUpci5kKG4sbyxmdW5jdGlvbih0KXtyZXR1cm4gZVt0XX0uYmluZChudWxsLG8pKTtyZXR1cm4gbn0sci5uPWZ1bmN0aW9uKGUpe3ZhciB0PWUmJmUuX19lc01vZHVsZT9mdW5jdGlvbigpe3JldHVybiBlLmRlZmF1bHR9OmZ1bmN0aW9uKCl7cmV0dXJuIGV9O3JldHVybiByLmQodCxcImFcIix0KSx0fSxyLm89ZnVuY3Rpb24oZSx0KXtyZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGUsdCl9LHIucD1cIlwiLHIoci5zPTApfShbZnVuY3Rpb24oZSx0LHIpe1widXNlIHN0cmljdFwiO3Iucih0KSx0LmRlZmF1bHQ9KCk9Pntjb25zb2xlLmxvZyhcImhlbGxvIHdvcmxkXCIpfX1dKTsiXSwibWFwcGluZ3MiOiJBQUFBIiwic291cmNlUm9vdCI6IiJ9
```

#### cheap模式

低开销，没有生成列映射(column mapping)，只是映射行数 。不与其他模式组合时会生成map文件标明对应的文件

js

```js
//# sourceMappingURL=app.js.map
```

#### hidden模式

会生成 map文件，但是生成的文件信息不会显示在混淆的代码里，一般用在生产环境构建，上传单独的 map 文件配合第三方定位工具使用

#### nosources模式

会生成 map 文件，map 信息里不包含 sourcesContent 信息

#### module模式

loader 模块之间对应的 sourceMap，以 react 为例，如果不加 module 那么定位时会指向压缩前的js处，而不能追踪到 jsx 中。所以一般会加上module配置

在配置webpack信息时可以根据实际情况混合搭配使用。

## 优化速度

#### 编译优化

使用第三方插件来辅助分析编译速度

* 时间分析插件：`speed-measure-webpack-plugin`
* 文件分析插件：`webpack-bundle-analyzer`

主要从三个方向来提升编译效率：

##### 1、减少执行编译的模块

* 找出不需要构建的模块并忽略，比如使用`webpack.IgnorePlugin`来忽略掉moment的别国语言文件

``` js
new webpack.IgnorePlugin({
  resourceRegExp: /^\.\/locale$/,
  contentRegExp: /moment$/
})
```



* 按需引入类库文件：使用`babel-plugin-lodash`等插件按需引入模块，同时借助wenpack的`tree shaking`特效减少文件体积。

* 抽离框架模块：使用`DllPlugin`或`externals`配置将核心框架模块单独构建打包，这样再次构建时就不用再次编译框架文件，减少构建时间。

2、提升单个模块的构件速度

* 合理利用loader的`include/exclude`功能，只对特定的目录文件打包。注意优先级exclude > include。
* 按项目需要是否开启编译`source map`功能，在关闭的情况下可以加快编译速度。
* 使用`ts-loader`编译时，设置`transpileOnly:false`可以忽略类型检查，加速编译。
* 配置项`reslove`配置指定查找模块文件规则。

3、并行构建以提升总体效率

* 使用`HappyPack`或`thread-loader`开启多进程方式加速编译
* 使用`parallel-webpack`多配置构建

#### 打包优化

 1、压缩js优化：`TerserWebpackPlugin `

``` js
new TerserWebpackPlugin{
  //缓存，默认开启
  cache:true,
  //多线程模式，默认开启
  parallel:true,
  terserOptions:{
    ...
    //参数的作用是执行特定的压缩策略,
    //例如省略变量赋值的语句，从而将变量的值直接替换到引入变量的位置上，减小代码体积，为false体积略涨，构建速度加快。
    compress:false,
    //是对源代码中的变量与函数名称进行压缩，为false体积略涨，构建速度加快
    mangle:true
  }
}
```

2、压缩css优化：使用 `CSSMinimizerWebpackPlugin`替代`OptimizeCSSAssetsPlugin`, `CSSMinimizerWebpackPlugin`会默认开启多进程选项 parallel，在大型项目时构建速度提升显著

3、设置`splitChunks`:{ chunks: 'all' } 抽离出公用模块

4、最大化使用`Tree Shaking`，

* `ES6 模块`：用ES Module模式开发，避免commonJS混用，比如引入`loash-es`。
* `sideEffects`：开发自有库模块时配置package.json选项`sideEffects: false`，用来告知webpack此模块为无副作用，可以安全移除未使用代码的功能
* `引入方式`：以 default 方式引入的模块，无法被 Tree Shaking；而引入单个导出对象的方式，无论是使用 import * as xxx 的语法，还是 import {xxx} 的语法，都可以进行 Tree Shaking
* `Babel`：使用 @babel/preset-env 中，modules 选项默认为 ‘auto’，它的含义是对 ES6 风格的模块不做转换（等同于 modules: false），而将其他类型的模块默认转换为 CommonJS 风格，这样可以对ES6模块进行 Tree Shaking

#### 缓存优化

1、`babel-loader`编译缓存

```js
{
loader: "string-replace-loader",
options:{
  //默认为false，为true时开启缓存，缓存目录：./node_modules/.cache/babel-loader/
  cacheDirectory:true,
  //计算缓存标识符，默认是一个由 @babel/core 版本号，babel-loader 版本号等组成的字符串。
  //可以一个自定义的值，当值改变后，强制缓存失效。
  cacheIdentifier: "",
  //默认为true，缓存内容压缩为 gz 包以减小缓存目录的体积，设置成false可以不压缩缓存，以提升速度。
  cacheCompression:false,
  
}
```

2、使用`cache-loader`缓存

``` js
rules: [
  {
    test: /\.js$/,
    use: ['cache-loader', 'babel-loader'],
  }
]
```

3、自动化构建缓存

使用package-lock.json关联缓存node_modules，当无新模块安装时默认走缓存模式。如果在容器内构建，可以针对缓存node_modules单独构建镜像，当package.json变动时重新安装，否则拉取镜像文件即可。

