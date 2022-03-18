## 应用场景

如果按照原始的 redux 工作流程，当组件中产生一个 action 后会直接触发 reducer 修改 state，reducer 又是一个纯函数，也就是不能再 reducer 中进行异步操作；
而往往实际中，组件中发生的 action 后，在进入 reducer 之前需要完成一个异步任务,比如发送 ajax 请求后拿到数据后，再进入 reducer,显然原生的 redux 是不支持这种操作的
这个时候急需一个中间件来处理这种业务场景，目前最优雅的处理方式自然就是 `redux-saga`

##  辅助函数

`redux-saga` 提供了一些辅助函数，用来在一些特定的 action 被发起到 Store 时派生任务，下面我先来讲解两个辅助函数：`takeEvery` 和 `takeLatest`

#### takeEvery

takeEvery 就像一个流水线的洗碗工，过来一个脏盘子就直接执行后面的洗碗函数，一旦你请了这个洗碗工他会一直执行这个工作，绝对不会停止接盘子的监听过程和触发洗盘子函数
例如：每次点击 按钮去 Fetch 获取数据时时，我们发起一个 FETCH_REQUESTED 的 action。 我们想通过启动一个任务从服务器获取一些数据，来处理这个 action，类似于

```js
window.addEventLister("xxx", fn);
```

当 dispatch xxx 的时候，就会执行 fn 方法，
首先我们创建一个将执行异步 action 的任务(也就是上边的 fn)：
- `put`：你就认为 put 就等于 dispatch 就可以了；
-  `call`：可以理解为实行一个异步函数,是阻塞型的，只有运行完后面的函数，才会继续往下；
在这里可以片面的理解为 async 中的 await！但写法直观多了！

```js
import { call, put } from "redux-saga/effects";

export function* fetchData(action) {
  try {
    const apiAjax = (params) => fetch(url, params);
    const data = yield call(apiAjax);
    yield put({ type: "FETCH_SUCCEEDED", data });
  } catch (error) {
    yield put({ type: "FETCH_FAILED", error });
  }
}
```

然后在每次 FETCH_REQUESTED action 被发起时启动上面的任务,也就相当于每次触发一个名字为 FETCH_REQUESTED 的 action 就会执行上边的任务,代码如下

```js
import { takeEvery } from "redux-saga";

function* watchFetchData() {
  yield* takeEvery("FETCH_REQUESTED", fetchData);
}
```

注意：上面的 takeEvery 函数可以使用下面的写法替换

```js
function* watchFetchData() {
  while (true) {
    yield take("FETCH_REQUESTED");
    yield fork(fetchData);
  }
}
```

#### takeLatest

在上面的例子中，takeEvery 允许多个 fetchData 实例同时启动，在某个特定时刻，我们可以启动一个新的 fetchData 任务， 尽管之前还有一个或多个 fetchData 尚未结束
如果我们只想得到最新那个请求的响应（例如，始终显示最新版本的数据），我们可以使用 takeLatest 辅助函数

```js
import { takeLatest } from "redux-saga";

function* watchFetchData() {
  yield* takeLatest("FETCH_REQUESTED", fetchData);
}
```

和 takeEvery 不同，在任何时刻 takeLatest 只允许执行一个 fetchData 任务，并且这个任务是最后被启动的那个，如果之前已经有一个任务在执行，那之前的这个任务会自动被取消

## Effect Creators

redux-saga 框架提供了很多创建 effect 的函数，下面我们就来简单的介绍下开发中最常用的几种

- `take(pattern)`
- `put(action)`
- `call(fn, ...args)`
- `fork(fn, ...args)`
- `select(selector, ...args)`

#### take(pattern)

take 函数可以理解为监听未来的 action，它创建了一个命令对象，告诉 middleware 等待一个特定的 action， Generator 会暂停，直到一个与 pattern 匹配的 action 被发起，才会继续执行下面的语句，也就是说，take 是一个阻塞的 effect
用法：

```js
function* watchFetchData() {
   while(true) {
   // 监听一个type为 'FETCH_REQUESTED' 的action的执行，直到等到这个Action被触发，才会接着执行下面的 		yield fork(fetchData)  语句
     yield take('FETCH_REQUESTED');
     yield fork(fetchData);
   }
}

```
#### put(action)
put 函数是用来发送 action 的 effect，你可以简单的把它理解成为 redux 框架中的 dispatch 函数，当 put 一个 action 后，reducer 中就会计算新的 state 并返回，注意： put 也是阻塞 effect
用法：

```js
export function* toggleItemFlow() {
  let list = [];
  // 发送一个type为 'UPDATE_DATA' 的Action，用来更新数据，参数为 `data：list`
  yield put({
    type: actionTypes.UPDATE_DATA,
    data: list,
  });
}
```

#### call(fn, ...args)

call 函数你可以把它简单的理解为就是可以调用其他函数的函数，它命令 middleware 来调用 fn 函数， args 为函数的参数，注意： fn 函数可以是一个 Generator 函数，也可以是一个返回 Promise 的普通函数，call 函数也是阻塞 effect
用法：

```js
export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function* removeItem() {
  try {
    // 这里call 函数就调用了 delay 函数，delay 函数为一个返回promise 的函数
    return yield call(delay, 500);
  } catch (err) {
    yield put({ type: actionTypes.ERROR });
  }
}
```

####  fork(fn, ...args)

fork 函数和 call 函数很像，都是用来调用其他函数的，但是 fork 函数是非阻塞函数，也就是说，程序执行完 yield fork(fn， args) 这一行代码后，会立即接着执行下一行代码语句，而不会等待 fn 函数返回结果后，在执行下面的语句
用法：

```js
import { fork } from "redux-saga/effects";

export default function* rootSaga() {
  // 下面的四个 Generator 函数会一次执行，不会阻塞执行
  yield fork(addItemFlow);
  yield fork(removeItemFlow);
  yield fork(toggleItemFlow);
  yield fork(modifyItem);
}
```

#### select(selector, ...args)

select 函数是用来指示 middleware 调用提供的选择器获取 Store 上的 state 数据，你也可以简单的把它理解为 redux 框架中获取 store 上的 state 数据一样的功能 ：store.getState()
用法：

```js
export function* toggleItemFlow() {
  // 通过 select effect 来获取 全局 state上的 `getTodoList` 中的 list
  let tempList = yield select((state) => state.getTodoList.list);
}
```

