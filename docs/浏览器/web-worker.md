## 概念
`Web Worker` 是 HTML5 提出的概念，分为

- 专用线程（Dedicated Web Worker）: 默认的 web worker ,仅能被创建它的脚本所使用（一个专用线程对应一个主线程）
- 共享线程（Shared Web Worker）:能够在不同的脚本中使用（一个共享线程对应多个主线程）,浏览器兼容差

判断是否支持

```js
if (window.Worker) {
  console.log("支持worker");
}
if (window.ShareWorker) {
  console.log("支持共享worker");
}
```

## 用途

- 懒加载
- 文本分析、复杂计算等
- 流媒体数据处理
- canvas 图形绘制
- 图像处理
- ...

## 用法限制

- 有同源限制
- 无法访问 DOM 节点
- 运行在另一个上下文中，无法使用 window 全局对象
- web worker 的运行不会影响主线程，但与主线程交互时仍受到主线程单线程的瓶颈制约。换言之，如果 worker 线程频繁与主线程进行交互，主线程由于需要处理交互，仍有可能使页面发生阻塞
- 共享线程可以被多个浏览上下文（Browsing context）调用，但所有这些浏览上下文必须同源（相同的协议，主机和端口号）

## 通信

使用`postMessage`通信

```js
//主线程
var workder = new Worder("demo.js");
workder.onmessage = function(e) {
  console.log("收到worker发来的消息" + e.data);
};

//worker 线程 demo.js
for (var i = 0; i < 10; i++) {
  postMessage(i);
}
```

在 worker 线程中，`self` 和 `this` 都代表子线程的全局对象。

```js
this.onmessage = function(e) {
  console.log("收到主线程发来的消息" + e.data);
};
```

共享线程在传递消息时，`postMessage()` 方法和 `onmessage` 事件必须通过端口对象调用

```js
// 主线程
var sharedWorker = new SharedWorker("shared-worker.js");
sharedWorker.port.onmessage = function(e) {};

//如果用addEventListener监听，则需要显示打开
sharedWorker.port.addEventListener("message", function(e) {}, false);
sharedWorker.port.start(); // 需要显式打开
```

在 Worker 线程中，需要使用 onconnect 事件监听端口的变化，并使用端口的消息处理函数进行响应。

```js
// Worker 线程
onconnect = function(e) {
  let port = e.ports[0];

  port.onmessage = function(e) {
    port.postMessage("已收到主线程发来的消息" + e.data);
  };
};
```

#### 关闭 worker

可以在主线程中使用 `terminate()` 方法或在 Worker 线程中使用 `close()` 方法关闭 worker

```js
// 主线程
worker.terminate();

//或者子线程
self.close();
```

#### 加载外部脚本

```js
importScripts("1.js", "2.js");
```

#### 嵌入式 Worker

```js
<script>
    var workerScript = `console.log("子线程")`
    var blob = new Blob(workerScript, {type: "text/javascript"})
    var worker = new Worker(window.URL.createObjectURL(blob))
</script>
```

## 可以使用的全局函数

[更多可以使用的全局函数](https://developer.mozilla.org/zh-CN/docs/Web/API/Web_Workers_API/Functions_and_classes_available_to_workers)

- **浏览器**
  - WorkerNavigator
  - WorkerLocation
- **时间相关**
  - clearInterval()
  - clearTimeout()
  - setInterval()
  - setTimeout
- **Worker 相关**
  - importScripts()
  - close()
  - postMessage()
- **存储相关**
  - Cache
  - IndexedDB
- **网络相关**
  - Fetch
  - WebSocket
  - XMLHttpRequest
