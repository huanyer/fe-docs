## 原理

- `解析（parse）`
	将代码解析成抽象语法树（`AST`），`Babel`是通过`Babylon`实现的。在解析过程中有两个阶段：**词法分析和语法分析**，词法分析阶段把字符串形式的代码转换为令牌（tokens）流，令牌类似于 AST 中节点；而语法分析阶段则会把一个令牌流转换成 AST 的形式，同时这个阶段会把令牌中的信息转换成 AST 的表述结构。

- `转换（transform）`
	`Babel`接受得到`AST`并通过`babel-traverse`对其进行深度优先遍历，在此过程中对节点进行添加、更新及移除操作。这部分也是 Babel 插件介入工作的部分。

- `生成（generate）`
	将经过转换的`AST`通过`babel-generator`再转换成 js 代码，过程就是深度优先遍历整个`AST`，然后构建可以表示转换后代码的字符串。

## 插件

基于babel7

- `@babel/cli`:

  为 babel 的脚手架工具，可以使用 babel 命令行形式

- `@babel/core`

   核心 api 都在这个模块里面，比如 transform、parse，用于字符串转码得到 抽象语法树（AST）

-  `@babel/node`

   直接在 node 环境中，运行 ES6 的代码

-  `babylon`

   babel 的解析器。

- `@babel/types`

   用于 AST 节点的 Lodash 式工具库, 它包含了构造、验证以及变换 AST 节点的方法，对编写处理 AST 逻辑非常有用。

- `@babel/traverse`

   用于对 AST 的遍历，维护了整棵树的状态，并且负责替换、移除和添加节点。

- `@babel/generator`

   Babel 的代码生成器，它读取 AST 并将其转换为代码和源码映射（sourcemaps）。

- `@babel/preset-env`

   预设插件集，相当于 ES2015 ，ES2016 ，ES2017 及最新版本

- `@babel/preset-react`:

  用于转换 react 的 jsx 语法，将 jsx 语法转换为 createElement 函数形式

- `@babel/register`

  改写 require 命令，为它加上一个钩子。此后，每当使用 require 加载 .js、.jsx、.es 、 .es6 后缀名的文件，就会先用  babel 进行转码，适用开发环境

- `@babel/polyfill`

  转换 ES6 中新的 API 比如  Iterator、Generator、Set、Maps、Proxy、Reflect、Symbol、Promise  等全局对象，以及一些定义在全局对象上的( Object.assign、Array.form 等)方法，注意：polyfill 是直接在代码中插入帮助函数，会导致污染了全局环境，并且不同的代码文件中包含重复的代码，导致编译后的代码体积变大，建议使用 plugin-transform-runtime 

- `@babel/runtime`

  提供了单独的包用以提供编译模块的工具函数，启用插件 plugin-transform-runtime 后，babel就会使用babel-runtime下的工具函数

- `@babel/plugin-transform-runtime`

  默认将es6每个文件共用的辅助函数生成到一个单独的babel-runtime文件中。打包完的文件体积对比 babel-polyfill 会小很多。而且 transform-runtime 不会污染原生的对象方法，也不会对其他 polyfill 产生影响。

  ``` js
  // 引入前使用async的每个文件会有这段代码
  function _asyncToGenerator(fn) { return function () {....}} // 很长很长一段
  
  //引入后，会直接引入@babel/runtime提供的工具函数
  var _asyncToGenerator = require("@babel/runtime/helpers/asyncToGenerator");
  ```

  > 使用 @babel/plugin-transform-runtime 的时候必须把 @babel/runtime 当做生产环境 dependencies 依赖

- `@babel/plugin-proposal-class-properties`

   转换 class 类语法为原型形式

- `@babel/plugin-proposal-decorators`

   转换装饰器模式语法，如使用 react-redux 的 @connect()

- `@babel/plugin-proposal-export-default-from`

  解析 export xxx from 'xxx'语法

## 执行顺序

```js
// .babelrc 文件
{
  "presets": [
    [
      "@babel/preset-env"
    ]
  ],
  "plugins": [
    ["@babel/plugin-proposal-decorators", { "legacy": true }],
    ["@babel/plugin-proposal-class-properties", { "loose": true }],
    "@babel/plugin-transform-runtime",
  ]
}

```

先正序执行`plugins`中插件，然后再倒序执行`presets`中插件

## 编写插件

模拟`babel-plugin-import`按需加载，主要就是返回包含`visitor`的对象

``` js
import * as babel from '@babel/core';
const c = `import { Button } from 'antd'`;

const { code } = babel.transform(c, {
  plugins: [
    function({ types: t }) {
      return {
        visitor: {
          ImportDeclaration(path,{ opts }) { //opts为插件配置项
            const { node: { specifiers, source } } = path;
            if (!t.isImportDefaultSpecifier(specifiers[0])) { // 对 specifiers 进行判断，是否默认倒入
              const newImport = specifiers.map(specifier => (
                t.importDeclaration(
                  [t.ImportDefaultSpecifier(specifier.local)],
                  t.stringLiteral(`${source.value}/lib/${specifier.local.name}`)
                )
              ))
              path.replaceWithMultiple(newImport)
            }
          }
        }
      }
    }
  ]
})

console.log(code); // import Button from "antd/lib/Button";
```

## 升级方式

`babel6`升级到`bebel7`

```bash
# 不安装到本地而是直接运行命令，npm 的新功能
npx babel-upgrade --write

# 或者常规方式
npm i babel-upgrade -g
babel-upgrade --write
```
