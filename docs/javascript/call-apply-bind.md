## call, apply, bind 区别

- `call`从第二个参数开始可以接收多个参数，`call(this,1,2)`，会立即执行
- `apply`可以将参数以数组的方式传递， `apply(this,[1,2])`，会立即执行
- `bind` 传参同`call`，但是会返回绑定后的函数，不会立即执行。

```js
var a = { value: 1 };
function getValue(name, age) {
  console.log(name, age, this.value);
}
getValue.call(a, "lily", 24);
getValue.apply(a, ["jam", 22]);

var fn = getValue.bind(a, "lucy", 21);
fn();
```

## 模拟 call、 apply、bind

##### 实现 call

可以从以下几点来考虑如何实现

- 不传入第一个参数，那么默认为 `window`
- 改变了 this 指向，让新的对象可以执行该函数。那么思路是否可以变成给新的对象添加一个函数，然后在执行完以后删除？

```js
Function.prototype.Call = function(context) {
  var context = context || window;
  // 给 context 添加一个属性
  context.fn = this;
  // 将 context 后面的参数取出来
  var args = [...arguments].slice(1);
  var result = context.fn(...args);
  // 删除 fn
  delete context.fn;
  return result;
};
```

##### 实现 apply

```js
Function.prototype.Apply = function(context) {
  var context = context || window;
  context.fn = this;

  var result;
  // 需要判断是否存储第二个参数
  // 如果存在，就将第二个参数展开
  if (arguments[1]) {
    result = context.fn(...arguments[1]);
  } else {
    result = context.fn();
  }

  delete context.fn;
  return result;
};
```

##### 实现 bind

`bind` 和其他两个方法作用也是一致的，只是该方法会返回一个函数。并且我们可以通过 `bind` 实现柯里化。

```js
Function.prototype.Bind = function(context) { //context 是需要指向的对象
  if (typeof this !== "function") {
    throw new TypeError("Error");
  }
  var _this = this; //指向调用的函数
  var args = [...arguments].slice(1); //除context 外参数
  // 返回一个函数
  return function F() {
    // 因为返回了一个函数，我们可以 new F()，所以需要判断
    if (this instanceof F) {
      return new _this(...args, ...arguments); // new Function()
    }
    return _this.apply(context, args.concat(...arguments));
  };
};
```
