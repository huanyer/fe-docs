## 原理

Hooks是React 函数式编程实现，以类似单链表的形式通过 next 按顺序串联所有的 Hook。

react 会生成一棵组件树（Fiber 单链表），树中每个节点对应了一个组件，hooks 的数据就作为组件的一个信息，存储在这些节点上，伴随组件一起出生，一起死亡。

## 执行过程

1、初次渲染的时候，按照Hooks定义如 useState，useEffect 的顺序，把 state，deps 等按顺序塞到 memoizedState 数组中缓存。

2、更新的时候，按照顺序，从 memoizedState 中把上次记录的值拿出来。

用数组方式模拟同时调用多个 useState useEffect的问题：

``` js
// 通过数组维护变量
let memoizedState  = []; //缓存状态数组
let currentCursor = 0; //当前指向节点

function useState(initVal) {
    memoizedState[currentCursor] = memoizedState[currentCursor] || initVal;
    function setVal(newVal) {
        memoizedState[currentCursor] = newVal;
        render(); 
    }
    // 返回state 然后 currentCursor+1
    return [memoizedState[currentCursor++], setVal]; 
}

function useEffect(fn, deps) {
  const hasChange = memoizedState[currentCursor]
    ? !deps.every((val, i) => val === memoizedState[currentCursor][i])
    : true;
  if (hasChange) {
    fn();
    memoizedState[currentCursor] = deps;
    currentCursor++; // 累加 currentCursor
  }
}
```



## Hooks 解决什么问题

1、实现业务逻辑与UI的分离，可以高复用业务逻辑代码。

2、使用函数式编码，摆脱各生命周期、this绑定写法，使代码层更精简。

## 模拟useState、useEffect

#### useState

```js
let val; // 放到全局作用域
function useState(initVal) {
    val = val|| initVal; // 判断val是否存在 存在就使用
    function setVal(newVal) {
        val = newVal;
        render(); // 修改val后 重新渲染页面
    }
    return [val, setVal];
}
```

#### useEffect

``` js
let memArr; // 为了记录状态变化 放到全局作用域
function useEffect(fn,deps){
    // 判断是否变化 
    const hasChange = memArr ?
    !deps.every((val,i) => { val=== memArr[i] }) :true;
    if( hasChange ){
        fn(); //执行回调
        memArr = deps;
    }
}
```

