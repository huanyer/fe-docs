## React 架构

- Scheduler（调度器）—— 调度任务的优先级，高优任务优先进入**Reconciler** （React 16版本新增）
- Reconciler（协调器）—— 负责找出变化的组件
- Renderer（渲染器）—— 负责将变化的组件渲染到页面上

## Scheduler（调度器）

注意：`2019.02.27`之前`React`使用`requestAnimationFrame` 模拟`requestIdleCallback`，以及计算帧的边界时间。

最新版本`React`实现了功能更完备的`requestIdleCallback polyfill`，这就是[Scheduler调度器](https://github.com/facebook/react/blob/1fb18e22ae66fdb1dc127347e169e73948778e5a/packages/scheduler/README.md)。除了在空闲时触发回调的功能外，**Scheduler**还提供了多种调度优先级供任务设置。
调度任务优先级

* `Immediate `立即执行优先级，需要同步执行的任务。
* `UserBlocking` 用户阻塞型优先级（250 ms 后过期），需要作为用户交互结果运行的任务（例如，按钮点击）。
* `Normal` 普通优先级（5 s 后过期），不必让用户立即感受到的更新。
* `Low` 低优先级（10 s 后过期），可以推迟但最终仍然需要完成的任务（例如，分析通知）。
* `Idle` 空闲优先级（永不过期），不必运行的任务（例如，隐藏界面以外的内容）。

调度器作用：

1. 将庞大的DOM处理任务进行拆分
2. 对拆分的任务进行优先级定义，计算过期时间。
3. 在每一帧的渲染任务完成后的时间片里执行优先级最高的任务。



## Reconciler（协调器）

我们知道，在`React15`中**Reconciler**是递归处理虚拟DOM的。让我们看看[React16的Reconciler](https://github.com/facebook/react/blob/1fb18e22ae66fdb1dc127347e169e73948778e5a/packages/react-reconciler/src/ReactFiberWorkLoop.new.js#L1673)。

我们可以看见，更新工作从递归变成了可以中断的循环过程。每次循环都会调用`shouldYield`判断当前是否有剩余时间。

```js
/** @noinline */
function workLoopConcurrent() {
  // Perform work until Scheduler asks us to yield
  while (workInProgress !== null && !shouldYield()) {
    workInProgress = performUnitOfWork(workInProgress);
  }
}
```

那么React16是如何解决中断更新时DOM渲染不完全的问题呢？

在React16中，**Reconciler**与**Renderer**不再是交替工作。当**Scheduler**将任务交给**Reconciler**后，**Reconciler**会为变化的虚拟DOM打上代表增/删/更新的[标记](https://github.com/facebook/react/blob/1fb18e22ae66fdb1dc127347e169e73948778e5a/packages/react-reconciler/src/ReactSideEffectTags.js)，类似这样：

```js
export const Placement = /*             */ 0b0000000000010;
export const Update = /*                */ 0b0000000000100;
export const PlacementAndUpdate = /*    */ 0b0000000000110;
export const Deletion = /*              */ 0b0000000001000;
```

整个`Scheduler`与`Reconciler`的工作都在内存中进行。只有当所有组件都完成`Reconciler`的工作，才会统一交给`Renderer`。

> Reconciler 将老的`同步更新（递归模式`）的架构变为 `异步可中断更新`（[fiber与时间切片](./fiber.md)）

Fiber Reconciler 重新实现了 React 的核心算法，整个 Virtual DOM 的更新任务拆分成一个个小的任务。每个小任务占用的很小，每次做完一个小任务之后，放弃一下自己的执行将主线程空闲出来，看看有没有其他的任务。如果有的话，就暂停本次任务，执行其他的任务，如果没有的话，就继续下一个任务

## Renderer（渲染器）

**Renderer**根据**Reconciler**为虚拟DOM打的标记，同步执行对应的DOM操作。

在React16架构中整个更新流程为：

![更新流程](images/react/process.png)

其中红框中的步骤随时可能由于以下原因被中断：

- 有其他更高优任务需要先更新
- 当前帧没有剩余时间

由于红框中的工作都在内存中进行，不会更新页面上的DOM，所以即使反复中断，用户也不会看见更新不完全的DOM。

> 事实上，由于**Scheduler**和**Reconciler**都是平台无关的，所以`React`为他们单独发了一个包[react-Reconciler](https://www.npmjs.com/package/react-reconciler)。你可以用这个包自己实现一个`ReactDOM`，具体见**参考资料**

