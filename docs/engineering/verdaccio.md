[verdaccio](https://github.com/verdaccio/verdaccio)是一个开源的 npm 私有仓库搭建工具，可以一键搭建属于自己公司的 npm 仓库。

## 安装

```bash
npm install verdaccion -g
```

## 启动

```bash
verdaccion
```

启动后会出现配置文件路径，及访问的链接

```bash
warn --- config file  - /root/.config/verdaccio/config.yaml
...
warn --- http address - http://localhost:4873/ - verdaccio/
```

修改配置文件，在`/root/.config/verdaccio/config.yaml`里末尾添加

```
listen: 0.0.0.0:4873
```

注意：请保证`4873`端口可访问，避免防火墙拦截

## 常驻后台

```bash
pm2 start verdaccion
```

注意：`verdaccion`不支持`pm2`的`cluster`方式,如果这种方式启动会出现未知的异常

## 访问

在浏览器中打开http://xx.xx.xx.xx:4873，如果能正常访问则说明搭建成功了

## 发布包

首先要去 npm 官网注册账号，添加账号同`npm`的流程，不熟悉的话可以查询一下

```bash
npm addUser --registry http://xx.xx.xx.xx:4873
```

输入账号、密码及邮箱，结果如下：

```bash
Username: demo
Password:
Email: (this IS public) xxx@163.com
Logged in as demo on http://xx.xx.xx.xx:4873/.
```

发布私有包到私有仓库

```
npm publish --registry http://xx.xx.xx.xx:4873
```

可以使用`registry`管理工具`nrm`来管理私有`registry`避免每次都要手动输入`registry`

```bash
npm install nrm -g
//company 为registry名称，可以随便输入，一般为公司简称
nrm set company  http://xx.xx.xx.xx:4873
nrm use company
```

然后就可以直接使用

```bash
npm addUser
npm publish
```

## 使用包

操作流程同`npm`安装包一致，只是注意`registry`要切换到公司私有服务器地址，如果不是用`nrm`管理切换，则需要带上私有`registry`

```bash
npm install --registry http://xx.xx.xx.xx:4873
```

执行完后 npm 会去私有服务器下载包，如果没找到则去 npm 官方仓库下载。
