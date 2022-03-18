## Router、Route

使用方式

```js
import { createBrowserHistory } from "history";
export default () => (
	<Router history={createBrowserHistory()}>
		<Route exact={true} path="/" component={Demo}></Route>
  </Router>
)
```



`Router` 是使用 RouterContext.Provider实现，通过Provider向子组件传递context值。

`RouterContext` 是由createContext创建的context对象，以单独文件存放，方便组件以 Consumer 引入使用

```js
// TODO: Replace with React.createContext once we can assume React 16+
import createContext from "mini-create-react-context";

const createNamedContext = name => {
  const context = createContext();
  context.displayName = name;
  console.log(`createNamedContext context:`, context);
  return context;
};

export default createNamedContext;
```



Route 消费 `RouterContext`获取 Router 传递的 props,  Route 中核心在 match 判断

* 配置了`Swicth`组件 ,Swicth会匹配路由对应的组件，处理成功后返回匹配内容为computedMatch。
* 否则由 matchPath函数匹配，此时匹配的结果主要由传递的`exact`字段决定。

``` js
const match = this.props.computedMatch
? this.props.computedMatch // <Switch> already computed the match for us
: this.props.path
? matchPath(location.pathname, this.props)
: context.match;
```

路由组件渲染（已删除 `__DEV__`模式代码），主要是children、component、render的类型判断处理，children 优先级最高。

``` js
<RouterContext.Provider value={props}>
  {props.match
    ? children
      ? typeof children === "function"
        ? children(props)
        : children
    : component
      ? React.createElement(component, props)
      : render
        ? render(props)
        : null
   : null}
</RouterContext.Provider>
```

