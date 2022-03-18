## window.postMessage

通过window对象引用，可以通过postMessage发送消息，一般用于window.open打开的页面间通信，可以跨源通信。

``` js
//A页面
var otherWin = window.open(...);
// 如果弹出框没有被阻止且加载完成

// 这行语句没有发送信息出去，即使假设当前页面没有改变location（因为targetOrigin设置不对）
otherWin.postMessage("The user is 'bob' and the password is 'secret'",
                  "https://secure.example.net");

// 假设当前页面没有改变location，这条语句会成功添加message到发送队列中去（targetOrigin设置对了）
otherWin.postMessage("hello there!", "http://example.org");

window.addEventListener("message", function(event){
  if (event.origin !== "http://example.org") return;
  console.log(event.data)
  // event.source 是我们通过window.open打开的弹出页面 otherWin
  // event.data 是 otherWin 发送给当前页面的消息 "hi there yourself!  the secret response is: rheeeeet!"

}, false);

//B页面
//当A页面postMessage被调用后，这个addEventListener调用
window.addEventListener("message", function (event){
  if (event.origin !== "http://example.com:8080") return;
  // event.source 就当前弹出页的来源页面
  // event.data 是 "hello there!"
  event.source.postMessage("hi there yourself!  the secret response " +
                           "is: rheeeeet!",
                           event.origin);
}, false);
```

## BroadcastChannel

`BroadcastChannel` 接口代理了一个命名频道，可以让指定 [origin](https://developer.mozilla.org/zh-CN/docs/Glossary/源) 下的任意 [browsing context](https://developer.mozilla.org/en-US/docs/Glossary/browsing_context) 来订阅它。它允许**同源**的不同浏览器窗口，Tab页，frame或者 iframe 下的不同文档之间相互通信。

``` js
//channel_demo参数用来指定channel的名称，连接到相同名称的BroadcastChannel，可以监听到这个channel分发的消息
var ch = new BroadcastChannel('channel_demo');
//监听
ch.onmessage = function (e) { console.log(e); }
//发送消息
ch.postMessage('This is a test message.'); 
//关闭
ch.close()
```

缺点：不兼容IE 和 Safari

## localStorage

通过监听**同源**下localStorage变化通信

``` js
//存储模拟消息发送
function sendMessage(message){
    localStorage.setItem('message',JSON.stringify(message));
    localStorage.removeItem('message');
}

//A、B 页面监听storage变化
window.addEventListener("storage", function(e){
    if (e.key == 'message') {
        // removeItem同样触发storage事件，此时newValue为空
        if(!e.newValue) return;
        console.log(JSON.parse(e.newValue));
    }
});
//A 页面
// 发送消息给B页面
sendMessage('this is message from A');


//B 页面 输出 this is message from A


```

当在A页面中执行sendMessage函数，其他同源页面会触发**storage**事件，**而A页面却不会触发storage事件**；而且连续发送两次相同的消息也只会触发一次storage事件，如果需要解决这种情况，可以在消息体体内加入时间戳，这样每次数据都会更新。

``` js
sendMessage({
    data: 'hello world',
    timestamp: Date.now()
})
```

