## cookie

一般由服务器生成，可以设置过期时间，数据存储大小`4K`,每次都会携带在 header 中，对于请求性能影响

cookie 涉及的安全问题

- `value`: 如果用于保存用户登录态，应该将该值加密，不能使用明文的用户标识
- `http-only`: 不能通过 JS 访问 Cookie，减少 XSS 攻击
- `secure:`只能在协议为 HTTPS 的请求中携带
- `same-site`:规定浏览器不能在跨域请求中携带 Cookie，减少 CSRF 攻击

## localStorage

键值对存储在浏览器本地，除非被清理，否则一直存在，数据大小`5M`，同源下数据多窗口也能共享

## sessionStorage

键值对存储在浏览器本地，页面关闭就清理，数据大小`5M`，数据仅在当前窗口有效，同一源下新窗口也访问不到其他窗口基于
`sessionStorage` 存储的数据

## indexDB

存储在浏览器本地，非关系型数据库，除非被清理，否则一直存在，无大小限制

## Cache Storage

`CacheStorage` 接口表示 Cache 对象的存储。它提供了一个 `ServiceWorker`、其它类型 worker 或者 window 范围内可以访问到的所有命名 cache 的主目录（它并不是一定要和 service workers 一起使用，即使它是在 service workers 规范中定义的），并维护一份字符串名称到相应 Cache 对象的映射

注意：CacheStorage 方法可以挂载在`caches`上使用，如`caches.macth()`

- `match()`：检查给定的 Request 是否是 CacheStorage 对象跟踪的任何 Cache 对象的键，并返回一个 resolve 为该匹配的 Promise .
- `has()`：如果存在与 cacheName 匹配的 Cache 对象，则返回一个 resolve 为 true 的 Promise .
- `open()`：返回一个 Promise ，resolve 为匹配 cacheName （如果不存在则创建一个新的 cache）的 Cache 对象
- `delete()`：查找匹配 cacheName 的 Cache 对象，如果找到，则删除 Cache 对象并返回一个 resolve 为 true 的 Promise 。如果没有找到
  Cache 对象，则返回 false.
- `keys()`：返回一个 Promise ，它将使用一个包含与 CacheStorage 追踪的所有命名 Cache 对象对应字符串的数组来 resolve. 使用该方法迭代所有 Cache 对象的列表。
