## 安装docker

##### docker  （[官网](https://www.docker.com/get-docker)、 [国内daocloud](https://get.daocloud.io/)）

```bash
curl -sSL https://get.daocloud.io/docker | sh
```

##### docker-compose （[github](https://github.com/docker/compose/releases)、 [国内daocloud](https://get.daocloud.io/)）

```bash
curl -L https://get.daocloud.io/docker/compose/releases/download/1.25.5/docker-compose-`uname -s`-`uname -m` > /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
```

## 搭建

##### 克隆依赖包 

```bash
git clone https://github.com/getsentry/onpremise.git
```

##### 安装

``` bash
cd onpremise
./install.sh
```

如果报错：FAIL: Expected minimum RAM available to Docker to be 2400 MB but found 1999 MB

给docker分配大一点的内存，比如4G

接着按着提示设置账号即可。



## 启动

安装完成后提示执行

``` bash
docker-compose up -d
```

启动成功后打开默认端口号`http://localhost:9000`访问

## 配置

onpremise 根目录下

```bash
vim sentry/config.yml
```

