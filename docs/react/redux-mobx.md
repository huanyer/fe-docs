## Redux

#### 何为 redux

`Redux` 的基本思想是整个应用的 `state` 保持在一个单一的 `store` 中。`store` 就是一个简单的 `javascript` 对象，而改变应用 `state` 的唯一方式是在应用中触发 `actions`，然后为这些 `actions` 编写 `reducers` 来修改 `state`。整个 `state` 转化是在 `reducers` 中完成，并且不应该由任何副作用。设计模式是发布订阅模式。

- 唯一的 store（Single Source of Truth）
- 保持状态只读（State is read-only）
- 数据改变只能通过纯函数完成（Changes are made with pure functions）

#### 在 Redux 中，何为 store

`Store` 是一个 javascript 对象，它保存了整个应用的 `state`。与此同时，Store 也承担以下职责：

- 通过 `getState()` 访问 state
- 通过 `dispatch(action)` 改变 state
- 通过 `subscribe(listener)` 注册 listeners
- 通过 `subscribe(listener)` 返回的函数处理 listeners 的注销

#### 何为 action

`Actions` 是一个纯 javascript 对象，它们必须有一个 `type` 属性表明正在执行的 `action` 的类型。实质上，`action` 是将数据从应用程序发送到 `store` 的有效载荷。

```js
function add() {
  return {
    type: "add"
  };
}
```

#### 何为 reducer

`reducer` 是一个纯函数,接收两个参数 state 和 Action，并返回下一个 state。

```js
const initState = {}

function reducer(state = initState,action){
  swicth(acition.type){
    case "add" :
      return {...state,name:"add"}
    case "delete" :
      return {...state,name:"delete"}
    default:
      return state
  }

}
```

#### Redux Thunk 的作用是什么

`Redux thunk` 是一个允许你编写返回一个函数而不是一个 `action` 的 `actions creators` 的中间件。如果满足某个条件，`thunk` 则可以用来延迟 `action` 的派发(dispatch)，这可以处理异步 `action` 的派发(dispatch)。

```js
function dosomething() {
  return (dipactch, getState) => {
    //dosometing
    dipactch({ type: "add", data: {} });
  };
}
```



## Redux中间件

* `redux-thunk`

  返回一个函数而不是一个 `action` 的 `actions creators` 的中间件。如果满足某个条件，`thunk` 则可以用来延迟 `action` 的派发(dispatch)，这可以处理异步 `action` 的派发(dispatch)。

  ```js
  //未使用
  function dosomething() {
    return { type: "add", data: {}}
  }
  
  //使用 thunk
  function dosomething() {
     dipactch({ type: "add", data: {} });
  }
  ```

* `redux-observable`

* `redux-saga`

  [redux-saga详细介绍](./redux-saga.md)

## Mobx

面向对象式，原理是通过`Proxy`劫持数据实现监听，当数据变化时更改视图。

缺点：

- 过于自由，可以在任何地方改变数据，如果代码不规范会造成逻辑混乱，很难追踪数据变化
