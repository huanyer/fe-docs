## Promise

`Promise` 是 JavsSript 异步编程解决方案，最初由社区提出来并用第三方库实现比如 `Q`、`bluebird`。不过现在已经加入 ES6 标准，主要通过链式调用方法解决异步回调嵌套问题。

`Pormise` 有三个状态 `pending`、`fulfilled`、`rejected`，`Promise` 只能被决议(完成或者拒绝)一次。之后再次试图完成或拒绝的动作都会 被忽略。因此，一旦 `Promise` 被决议，它就是不变量，不会发生改变。

> [Promise 模拟源码实现](../javascript/promise手写实现.md)

### 创建 Promise

```js
var p = new Promise(function (resolve, reject) {
  resolve(1);
})
  .then(function (value) {
    console.log(value); //1
  })
  .catch(function (err) {
    console.log('错误', err);
  })
  .finally(function () {
    console.log('最终都会执行');
  });
```

- 1、`Promise` 是一个构造函数，可以使用 `new` 操作符创建 `promise`。
- 2、构造函数 `Promise` 的参数是一个函数，这个函数有两个参数 `resolve` 和 `reject`，它们分别是两个函数。`resolve` 将状态 `pending`（等待）转换为 `resolved`（已解决），`reject` 将状态 `pending`（等待）转换为 `rejected`（已失败）。
- 3、创建的 `promise` 对象有 `then`、`catch`、`finally` 方法。

### Promise.all

包裹多个 `Promise` 实例，新的 `Promise` 对象的状态由被包裹的 `Promise` 对象的状态决定，只有被包裹的对象状态都被 `resolve` 了，那么新的 `Promise` 的状态才会 `resolve`，否则会 `reject`

```js
//都是resolve状态则返回值
var p = Promise.all([Promise.resolve(1), Promise.resolve(2)]).then(function (
  res
) {
  console.log(res); // [1,2]
});

//只要有一个reject状态就catch
var p = Promise.all([Promise.resolve(1), Promise.reject(2)])
  .then(function (res) {
    console.log('未返回结果，直接cacth');
  })
  .catch(function (err) {
    console.log('reject ', err);
  });
```

注：`reject`后其余任务不会中断执行。

### Promise.race

包裹多个 Promise 实例，只要包裹的的 Promise 对象中有一个的状态发生了改变，那么组成的这个新的 Promise 对象的状态就是上面那个率先改变的 Promise 实例的状态。

```js
var demo = [3, 2, 1].map((value) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(value);
    }, value * 1000);
  });
});

var p = Promise.race(demo)
  .then(function (res) {
    console.log(res); // 1
  })
  .catch(function (err) {
    console.log('reject ', err);
  });
```

## Generator

ES6 中新加入的生成器，在 Promise 的基础上更进一步，允许用同步的方式来描述我们的异步流程。

generator 函数样例，由 \* 和 yield 组成

```js
function* generator() {
  yield 'hello';
  yield 'world';
}

var a = generator();
a.next(); // {value:"hello",done:false}
a.next(); // {value:"world",done:false}
a.next(); // {value:undefined,done:true}
```

yield\* 可以在 generator 函数中调用 generator 函数

```js
function* a() {
  yield 1;
  return 2;
}

function* b() {
  var value = yield* a();
  console.log(value);
}
var c = b();
c.next(); //{value: 1, done: false}
c.next(); // 2
```

生成器有两个方法
1、return

比如上面样例执行 return 方法，将生成器置为终止状态，并将 value 值改为入参

```js
a.return(4) {value:4,done:true}
```

注意：当代码块中有 try finally 时，return 不会终止，会先执行 finally 代码再终止，如：

```js
function* generator() {
  try {
    yield 'hello';
  } finally {
    yield 'world';
  }
}

var a = generator();
a.next(); // {value:"hello",done:false}
a.return('end'); // {value:"world",done:false}
a.next(); //{value:"4",done:false}
```

所以实际使用中要避免 finally 与 yield 混用

2、throw
向生成器当前暂停位置抛出错误，如生成器内部没有捕获错误则状态终止

3、数组对象是一个迭代器

数组`Array`原型中有一个内置属性`Symbol.iterator` ，这个属性就行内置的迭代函数，所以数组可以用`for of`遍历

```js
var a = [1, 3, 4];
var gen = a[Symbol.iterator]();
gen.next(); // {value:1,done:false}
gen.next(); // {value:3,done:false}
gen.next(); // {value:4,done:false}
gen.next(); // {value:undefind,done:true}
```

## Async

`async/await`语法是 ES7 引入的 generator 语法糖，内置执行器，不需要调用 next 执行，可以自动执行函数内部代码。

async 函数返回一个 Promise 对象
如果在 async 函数中 return 一个直接量，async 会把这个直接量通过`Promise.resolve()` 封装成 Promise 对象;
如果 async 函数没有返回值,它会返回 `Promise.resolve(undefined)`

如果 await 后面不是一个 promise 对象，那跟着的表达式的运算结果就是它的结果；
如果是一个 promise 对象，await 会阻塞后面的代码，等 promise 对象 resolve，得到 resolve 的值作为 await 表达式的运算结果。

await 会阻塞代码执行，但 await 在 async 中，async 不会阻塞，它内部所有的阻塞都被封装在一个 promise 对象中异步执行

附上 Bable 编译的 async 代码，用 promise 模拟实现

```js
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
  try {
    var info = gen[key](arg);
    var value = info.value;
  } catch (error) {
    reject(error);
    return;
  }
  if (info.done) {
    resolve(value);
  } else {
    Promise.resolve(value).then(_next, _throw);
  }
}

function _asyncToGenerator(fn) {
  return function () {
    var self = this,
      args = arguments;
    return new Promise(function (resolve, reject) {
      var gen = fn.apply(self, args);
      function _next(value) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, 'next', value);
      }
      function _throw(err) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, 'throw', err);
      }
      _next(undefined);
    });
  };
}
```
