

## 虚拟 dom 实现原理

- 使用`@babel/plugin-transform-react-jsx`将 jsx 代码转换为`React.createElement(...)`形式

```js
<div className="nav">
  title
  <span key="1">jsx</span>
</div>;
//转换后
React.createElement("div", { className: "nav" }, [
  "title",
  React.createElement("span", { key: "1" }, "jsx"),
]);
```

- `createElement`函数对`key`和`ref`等特殊的`props`进行处理，并获取`defaultProps`对默认`props`进行赋值，并且对传入的孩子节点进行处理，最终构造成一个`ReactElement`对象（所谓的虚拟 DOM）。

```js
{
  attrs: { className:"nav" },
  children: [
    "title",
    {
      attrs: {
        onClick: () => console.log()
      },
      children: ["jsx"],
      key: 1,
      tag: "span"
    }
  ],
  tag: "div"
};
```

- `ReactDOM.render`将生成好的虚拟 DOM 渲染到指定容器上，其中采用了批处理、事务等机制并且对特定浏览器进行了性能优化（如当前是`IE`或`Edge`，则需要递归插入`DOMLazyTree`中缓存的子节点，其他浏览器只需要插入一次当前节点），最终转换为真实`DOM`。

## 虚拟DOM的组成

- `type`：元素的类型，可以是原生html类型（字符串），或者自定义组件（函数或`class`）
- `key`：组件的唯一标识，用于`diff`算法
- `ref`：用于访问原生`dom`节点
- `props`：传入组件的`props`，`chidren`是`props`中的一个属性，它存储了当前组件的孩子节点，可以是数组（多个孩子节点）或对象（只有一个孩子节点）
- `owner`：当前正在构建的`Component`所属的`Component`
- `self`：（非生产环境）指定当前位于哪个组件实例
- `_source`：（非生产环境）指定调试代码来自的文件(`fileName`)和代码行数(`lineNumber`)

## 防止XSS

`ReactElement`对象还有一个`$$typeof`属性，它是一个`Symbol`类型的变量`Symbol.for('react.element')`，当环境不支持`Symbol`时，`$$typeof`被赋值为`0xeac7`。

这个变量可以防止`XSS`。如果你的服务器有一个漏洞，允许用户存储任意`JSON`对象， 而客户端代码需要一个字符串，这可能为你的应用程序带来风险。`JSON`中不能存储`Symbol`类型的变量，而`React`渲染时会把没有`$$typeof`标识的组件过滤掉。

## 虚拟dom事件机制

`React`自己实现了一套事件机制，其将所有绑定在虚拟`DOM`上的事件映射到真正的`DOM`事件，并将所有的事件都代理到`document`上（最新版已经代理到root节点，防止多个root节点时事件混淆），自己模拟了事件冒泡和捕获的过程，并且进行统一的事件分发。

`React`自己构造了合成事件对象`SyntheticEvent`，这是一个跨浏览器原生事件包装器。 它具有与浏览器原生事件相同的接口，包括`stopPropagation()`和`preventDefault()`等等，在所有浏览器中他们工作方式都相同。这抹平了各个浏览器的事件兼容性问题。




## 为什么使用虚拟dom

* 提升开发效率：通过数据驱动视图，react会自动完成属性操作、事件处理、dom更新
* 提升性能：减少dom的频繁更新而引起的渲染引擎重绘及回流，dom只重新渲染一次可以降低不必要的开销以优化性能
* 跨浏览器兼容：模拟了事件冒泡和捕获的过程，采用了事件代理，批量更新等方法，抹平了各个浏览器的事件兼容性问题
* 跨平台兼容：React Native