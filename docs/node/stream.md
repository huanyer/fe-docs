#### 什么是 stream

`stream`是一种数据流，可以生成数据（`Buffer`）也可以吸收数据，通常和方法`pipe()`配合使用

#### stream 流转过程

以控制台输入为例

```js
process.stdin.on("data", function(chunk) {
  console.log("stream by stdin", chunk);
  console.log("stream by stdin", chunk.toString());
});

//输入1111
//stream by stdin <Buffer 31 31 31 31 0a>
//stream by stdin 1111
```

运行上面代码：然后从控制台输入任何内容都会被`data` 事件监听到，`process.stdin`就是一个`stream`对象,`data` 是`stream`对象用来监听数据传入的一个自定义函数，通过输出结果可看出`process.stdin`是一个`stream`对象。

说明： `stream` 对象可以监听`"data","end","open","close","error"`等事件

##### 管道 `pipe`

`pipe`的作用就是使来源`source`流向目的地`dest`,类似一个管道的作用起到连接作用。

`pipe`支持串行连接，如：`source.pipe(a).pipe(b).pipe(c)`

如果要监听每个流向过程中数据

```js
source
  .on("end", data => {
    console.log("source data");
  })
  .pipe(a)
  .on("end", data => {
    console.log("a data");
  })
  .pipe(b)
  .on("end", data => {
    console.log("b data");
  });
```

主意：`on`监听的是上一个发起的流而不是流向流

#### stream 的作用

- 可以读取大文件并发送给客户端

以`express`框架为例

```js
server.get("/", (req, res) => {
  const stream = fs.createReadStream("./index.md");
  stream.pipe(res);
});
```

- 实现文件上传

```js
server.post("/upload", (req, res) => {
  const localFile = res.files.file;
  const localStream = fs.createReadStream(localFile.path);
  const uploadStream = fs.createWriteStream("./index.md");
  localStream.pipe(uploadStream);
  localStream.on("end", data => {
    console.log("上传完成");
  });
});
```

#### 有什么缺点

- `soucre.pipe(dest)`, soucre 会完全覆盖 dest 内容
- 已结束的流不能再次重复使用，只能重新发起。

