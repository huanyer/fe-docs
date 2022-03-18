## 重点部分

####  React 的工作原理

React 会创建一个虚拟 `DOM(virtual DOM)`。当一个组件中的状态改变时，React 首先会通过 `diff` 算法来标记虚拟 DOM 中的改变，第二步是调节`(reconciliation)`，会用 `diff `的结果来更新 `DOM`。

####  虚拟 DOM 如何工作？

- 当数据发生变化，比如`setState` 时，会引起组件重新渲染，整个 UI 都会以虚拟dom 的形式重新渲染
- 然后收集差异也就是 `diff` 新的 虚拟dom 和老的 虚拟dom 的差异
- 最后把差异队列里的差异，比如增加节点、删除节点、移动节点更新到真实的 DOM 上

#### 虚拟 DOM 原理、特性总结

- 使用`React.createElement`或`JSX`编写`React`组件，实际上所有的`JSX`代码最后都会转换成`React.createElement(...`)，Babel 帮助我们完成了这个转换的过程。

- `createElement`函数对`key`和`ref`等特殊的`props`进行处理，并获取`defaultProps`对默认`props`进行赋值，并且对传入的孩子节点进行处理，最终构造成一个`ReactElement`对象（所谓的虚拟 DOM）。

- `ReactDOM.render`将生成好的虚拟 DOM 渲染到指定容器上，其中采用了批处理、事务等机制并且对特定浏览器进行了性能优化，最终转换为真实`DOM`。

#### 虚拟 DOM 的组成

即`ReactElementelement`对象，我们的组件最终会被渲染成下面的结构：

- `type`：元素的类型，可以是原生 html 类型（字符串），或者自定义组件（函数或 class）
- `key`：组件的唯一标识，用于 Diff 算法，下面会详细介绍
- `ref`：用于访问原生 dom 节点
- `props`：传入组件的 props，`chidren` 是 props 中的一个属性，它存储了当前组件的孩子节点，可以是数组（多个孩子节点）或对象（只有一个孩子节点）
- `owner`：当前正在构建的 Component 所属的 Component
- `self`：（非生产环境）指定当前位于哪个组件实例
- `_source`：（非生产环境）指定调试代码来自的文件(fileName)和代码行数(lineNumber)

#### React Diff原理

[diff原理](./diff.md)

####  setState 的内部实现

1、`enqueueSetState`将`state`放入队列中，并调用`enqueueUpdate`处理要更新的`Component`

 2、如果组件当前正处于update事务中，则先将`Component`存入`dirtyComponent`中。否则调用`batchedUpdates`处理。

3、`batchedUpdates`发起一次`transaction.perform()`事务

4、开始执行事务初始化，运行，结束三个阶段

​      初始化：事务初始化阶段没有注册方法，故无方法要执行

​      运行：执行setSate时传入的callback方法，一般不会传callback参数

​      结束：更新`isBatchingUpdates`为false，并执行`FLUSH_BATCHED_UPDATES`这个wrapper中的close方法

  5、`FLUSH_BATCHED_UPDATES在close`阶段，会循环遍历所有的`dirtyComponents`，调用`updateComponent`刷新组件，并执行它的`pendingCallbacks`, 也就是setState中设置的callback

#### React Hooks 原理与区别

Hooks 的原理与 `setState` 基本一致，

简易代码实现

``` js
function render() {
  ReactDOM.render(<App />, document.getElementById("root"));
}

let state: any;

function useState<T>(initialState: T): [T, (newState: T) => void] {
  state = state || initialState;

  function setState(newState: T) {
    state = newState;
    render();
  }

  return [state, setState];
}

render(); // 首次渲染
```



####  React Fiber算法


## 其他部分

#### React 中元素与组件的区别

- 元素是 React 中最小基本单位如 div，它不是真实的 DOM 元素，它仅仅是 js 的普通对象（plain objects)
- 组件是由元素构成,数据结构是类或纯函数。

#### react16 版本的 reconciliation 阶段和 commit 阶段是什么

- `reconciliation` 阶段包含的主要工作是对 `current tree` 和 `new tree` 做 `diff` 计算，找出变化部分。进行遍历、对比等是可以中断，歇一会儿接着再来。
- `commit` 阶段是对上一阶段获取到的变化部分应用到真实的 DOM 树中，是一系列的 DOM 操作。不仅要维护更复杂的 DOM 状态，而且中断后再继续，会对用户体验造成影响。在普遍的应用场景下，此阶段的耗时比 `diff` 计算等耗时相对短。

####  forceUpdate()  与 setState 区别？

`forceUpdate` 强制更新，不会触发 `shouldComponentUpdate`

####  react 的事件机制

- 当用户在为 `onClick` 添加函数时，`React` 并没有将 `Click` 事件绑定在 `DOM` 上面。
- 而是在 `document` 处监听所有支持的事件，当事件发生并冒泡至 `document` 处时，React 将事件内容封装交给中间层 `SyntheticEvent`（负责所有事件合成）
- 所以当事件触发的时候，对使用统一的分发函数 `dispatchEvent` 将指定函数执行。

#### React Portal

Portals 提供了一种很好的将子节点渲染到父组件以外的 DOM 节点的方式。

```js
ReactDOM.createPortal(child, container);
```

第一个参数（child）是任何可渲染的 `React` 子元素，例如一个元素，字符串或碎片。第二个参数（container）则是一个 DOM 元素。

#### 上下文 Context

`Context` 通过组件树提供了一个传递数据的方法，从而避免了在每一个层级手动的传递 `props` 属性。

- 用法：在父组件上定义 `getChildContext` 方法，返回一个对象，然后它的子组件就可以通过 `this.context` 属性来获取

```js
import React, { Component } from "react";
import PropTypes from "prop-types";

class Title extends Component {
  static contextTypes = {
    color: PropTypes.string
  };

  render() {
    return <div style={{ color: this.context.color }}>Title</div>;
  }
}

class Page extends Component {
  constructor() {
    super();
    this.state = { color: "red" };
  }

  static childContextTypes = {
    color: PropTypes.string,
    changeColor: PropTypes.func
  };

  getChildContext() {
    return {
      color: this.state.color,
      changeColor: color => {
        this.setState({ color });
      }
    };
  }
  render() {
    return <Title />;
  }
}
```

####  React 优点

- 只需查看 `render` 函数就会很容易知道一个组件是如何被渲染的
- `JSX` 的引入，使得组件的代码更加可读，也更容易看懂组件的布局，或者组件之间是如何互相引用的
- 支持服务端渲染，这可以改进 `SEO` 和性能
- 易于测试
- `React` 只关注 `View` 层，所以可以和其它任何框架(如 Backbone.js, Angular.js)一起使用

#### 展示组件(Presentational component)和容器组件(Container component)之间有何不同

展示组件关心组件看起来是什么。展示专门通过 props 接受数据和回调，并且几乎不会有自身的状态，但当展示组件拥有自身的状态时，通常也只关心 UI 状态而不是数据的状态。

容器组件则更关心组件是如何运作的。容器组件会为展示组件或者其它容器组件提供数据和行为(behavior)，它们会调用 `Flux actions`，并将其作为回调提供给展示组件。容器组件经常是有状态的，因为它们是(其它组件的)数据源。

#### 类组件(Class component)和函数式组件(Functional component)之间有何不同

- 类组件不仅允许你使用更多额外的功能，如组件自身的状态和生命周期钩子，也能使组件直接访问 `store` 并维持状态
- 当组件仅是接收 `props`，并将组件自身渲染到页面时，该组件就是一个 '无状态组件(stateless component)'，可以使用一个纯函数来创建这样的组件。这种组件也被称为哑组件(dumb components)或展示组件

#### (组件的)状态(state)和属性(props)之间有何不同

`State` 是一种数据结构，用于组件挂载时所需数据的默认值。`State` 可能会随着时间的推移而发生突变，但多数时候是作为用户事件行为的结果。

`Props`(properties 的简写)则是组件的配置。`props` 由父组件传递给子组件，并且就子组件而言，`props` 是不可变的(immutable)。组件不能改变自身的 props，但是可以把其子组件的 props 放在一起(统一管理)。Props 也不仅仅是数据--回调函数也可以通过 props 传递。

#### 指出(组件)生命周期方法的不同

- `componentWillMount` -- 多用于根组件中的应用程序配置
- `componentDidMount` -- 在这可以完成所有没有 DOM 就不能做的所有配置，并开始获取所有你需要的数据；如果需要设置事件监听，也可以在这完成
- `componentWillReceiveProps` -- 这个周期函数作用于特定的 prop 改变导致的 state 转换
- `getDerivedStateFromProps` -- react16 引入替代`componentWillReceiveProps` ，将 `props` 合并到 `state`,此生命周期在 v16.4 版本后当 `props`和`state`变化后都会触发
- `shouldComponentUpdate` -- 如果你担心组件过度渲染，`shouldComponentUpdate` 是一个改善性能的地方，因为如果组件接收了新的 `prop`， 它可以阻止(组件)重新渲染。shouldComponentUpdate 应该返回一个布尔值来决定组件是否要重新渲染
- `componentWillUpdate` -- 很少使用。它可以用于代替组件的 `componentWillReceiveProps` 和 `shouldComponentUpdate`(但不能访问之前的 props)
- `getSnapsshotBeforeUpdate` -- react16 引入替代`componentWillUpdate`,生成的结果会当做 `componentDidUpdate`的第三个参数传入
- `componentDidUpdate` -- 常用于更新 DOM，响应 prop 或 state 的改变
- `componentDidCatch` -- react16 引入，用来捕获字组件异常错误
- `componentWillUnmount` -- 在这你可以取消网络请求，或者移除所有与组件相关的事件监听器

#### 何为受控组件(controlled component)

在 HTML 中，类似 `<input>`, `<textarea>` 和 `<select>` 这样的表单元素会维护自身的状态，并基于用户的输入来更新。当用户提交表单时，前面提到的元素的值将随表单一起被发送。但在 `React` 中会有些不同，包含表单元素的组件将会在 state 中追踪输入的值，并且每次调用回调函数时，如 `onChange` 会更新 `state`，重新渲染组件。一个输入表单元素，它的值通过 React 的这种方式来控制，这样的元素就被称为"受控元素"。

#### 在 React 中，refs 的作用是什么

`Refs` 可以用于获取一个 `DOM` 节点或者 `React` 组件的引用。何时使用 `refs` 的好的示例有管理焦点/文本选择，触发命令动画，或者和第三方 DOM 库集成。你应该避免使用 `String` 类型的 `Refs`。**需要注意的是 ref 不能直接用在纯函数组件上，如果纯函数组件需要用 ref，可以使用`React.forwarRef()`包裹**

```js
//bad
<div ref="dom"></div>

//good

this.ref = React.createRef()

<div ref={this.ref}></div>

//或者
<div ref={(node) => this.ref = node}></div>

```

#### 何为高阶组件(higher order component)

高阶组件是一个以组件为参数并返回一个新组件的函数。`HOC` 运行你重用代码、逻辑和引导抽象。最常见的可能是 `Redux` 的 `connect` 函数。除了简单分享工具库和简单的组合，`HOC` 最好的方式是共享 `React` 组件之间的行为。如果你发现你在不同的地方写了大量代码来做同一件事时，就应该考虑将代码重构为可重用的 `HOC`。

#### 使用箭头函数(arrow functions)的优点是什么

- 作用域安全：在箭头函数之前，每一个新创建的函数都有定义自身的 `this` 值(在构造函数中是新对象；在严格模式下，函数调用中的 `this` 是未定义的；如果函数被称为“对象方法”，则为基础对象等)，但箭头函数不会，它会使用封闭执行上下文的 `this` 值。
- 简单：箭头函数易于阅读和书写
- 清晰：当一切都是一个箭头函数，任何常规函数都可以立即用于定义作用域。开发者总是可以查找 next-higher 函数语句，以查看 `this` 的值

#### 为什么建议传递给 setState 的参数是一个 callback 而不是一个对象

因为 `this.props` 和 `this.state` 的更新可能是异步的，不能依赖它们的值去计算下一个 `state`。

#### 当渲染一个列表时，何为 key？设置 key 的目的是什么

`key` 会有助于 `React` 识别哪些 `items` `key` 应该被赋予数组内的元素以赋予(DOM)元素一个稳定的标识，选择一个 `key` 的最佳方法是使用一个字符串，该字符串能惟一地标识一个列表项。很多时候你会使用数据中的 `id` 作为 `key`，当你没有稳定值 用于被渲染的 `items` 时，可以使用项目索引作为渲染项的 `key`，但这种方式并不推荐，如果 `items` 可以重新排序，就会导致 `re-render` 变慢。

#### (在构造函数中)调用 super(props) 的目的是什么

在 `super()` 被调用之前，子类是不能使用 `this` 的，在 ES2015 中，子类必须在 `constructor` 中调用 `super()`。传递 `props` 给 `super()` 的原因则是**便于(在子类中)能在 `constructor` 访问 `this.props`**。

#### 何为 JSX

`JSX` 是 JavaScript 语法的一种语法扩展，并拥有 JavaScript 的全部功能。`JSX` 生产 `React` "元素"，你可以将任何的 JavaScript 表达式封装在花括号里，然后将其嵌入到 JSX 中。在编译完成之后，JSX 表达式就编程了常规的 JavaScript 对象，这意味着你可以在 `if` 语句和 `for` 循环内部使用 `JSX`，将它赋值给变量，接受它作为参数，并从函数中返回它。

#### 怎么用 React.createElement 重写下面的代码

```js
const element = <h1 className="greeting">Hello, world!</h1>;
```

```js
//React.createElement(dom标签，props,子节点)
const element = React.createElement(
  "h1",
  { className: "greeting" },
  "Hello, world!"
);
```

#### 何为 `Children`

`this.props.children` 是自动传递给组件的属性，这个属性是类数组，有许多可用的方法。包括：

- `React.Children.map`
  `React.Children.map(props.children, child => {})`第一个就是我们通常要处理的 prop.children，第二个入参回调，其实就是我们遍历的元素上下文，通过它，我们能够进行定制化的操作。

当`props.children`为`null`和`undefined`时，最终会原值返回，其余情景则是返回一个数组。

- `React.Children.forEach`
  跟`React.Children.map`类似，都是迭代操作，只不过这个不会返回数组。`undefined`和`null`时的判断逻辑同上。

- `React.Children.count`
  返回其中内部元素数，其值与前面两个迭代方法的回调触发次数相等。

- `React.Children.only`
  用于判断传入的`children`是否只有一个`child`。注意接收类型是`React element`。不能拿`React.Children.map()`返回的结果再去判断是几个`child`，因为此时你拿到的已然是一个`Array`类型。

- `React.Children.toArray`

这个 API 会`props.children`数据结构转化为`Array`结构，常用在往下传`props`时，重新排序或过滤部分`children`的情景。
