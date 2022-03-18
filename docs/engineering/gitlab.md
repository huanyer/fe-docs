## gitlab 安装

以`Centos7`系统为例：

镜像下载源：

https://mirrors.tuna.tsinghua.edu.cn/gitlab-ce/yum/el7/  版本可以选择比较新的。

```bash
rpm -i gitlab-ce-13.1.10-ce.0.el7.x86_64.rpm
```

修改配置文件
``` bash
# external_url  修改为本机地址:端口
vim /etc/gitlab/gitlab.rb
# 配置生效
gitlab-ctl reconfigure 
# 重启
gitlab-ctl restart
# 查看状态
gitlab-ctl status
```

查看版本号

``` bash
cat /opt/gitlab/embedded/service/gitlab-rails/VERSION
```

#### 卸载

```bash
gitlab-ctl stop
# 卸载
rpm -e gitlab-ce
# 查看gitlab进程
ps aux | grep gitlab
# 杀掉进程 （包含很多......进程）
kill -9 xxx
# 删除所有包含gitlab 文件
find / -name gitlab | xargs rm -rf
```



## 配置静态IP

以Parallers Desktop虚拟机为例

查看虚拟机当前网络IP： 虚拟机配置--> 硬件 --> 网络 --> 共享网络 --> 高级 --> 打开网络首选项

> 注意：如果宿主机无法访问虚拟机，网络连接方式选择共享网络，如果不行试试桥接-默认适配器。

如IP是 `192.168.0.22`，则记录下网段`192.168.0`

修改虚拟机默认网卡

```bash
vim /etc/sysconfig/network-scripts/ifcfg-eth0
```

修改以下配置项

``` bash

# 从dhcp改成static
BOOTPROTO=static
# 从no改成yes。系统将在启动时自动开启该接口。
ONBOOT=yes
# 设置静态IP地址
IPADDR=192.168.0.100
# 设置子网掩码
NETMASK=255.255.255.0
# 设置网关
GATEWAY=192.168.0.1
# 设置DNS
DNS1=114.114.114.114

```

重启网络

``` bash
service network restart
```

结束！宿主机可以连接 虚拟机IP: 192.168.0.100

测试 9000 端口是否可以访问

``` bash
nc -vz -w 2 192.168.0.100 9000
```

如果不能访问要配置防火墙

``` bash
firewall-cmd --add-port=9000/tcp  --permanent
systemctl restart firewalld
```

## gitlab-runner

配置 runner安装源

```bash
vim /etc/yum.repos.d/gitlab-ce.repo
# 增加 清华镜像源
[gitlab-runner]
name=gitlab-runner
baseurl=https://mirrors.tuna.tsinghua.edu.cn/gitlab-runner/yum/el7/
repo_gpgcheck=0
gpgcheck=0
enabled=1
gpgkey=https://packages.gitlab.com/gpg.key
# 安装
yum install gitlab-runner
# 设置超管用户，否则会报无权限相关错误
gitlab-runner install --working-directory /home/gitlab-runner --user root   # 安装并设置--user(设置为root)
# 注册 ，依次输入相关配置，executor 选shell
gitlab-ci-multi-runner  register 
# 启动
gitlab-ci-multi-runner  start
```

