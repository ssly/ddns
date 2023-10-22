# DDNS - 基于 Docker | Nodejs

> 有任何问题可提交 issues

## 用途
- 通过域名访问家庭网络
- 仅支持家庭网络有动态公网IP
- 目前支持阿里云、腾讯云的域名服务

## 前提

- 🕸️家庭网络需要有动态公网IP
  - 如果有静态公网IP，你可以直接域名解析使用了🐒
  - 目前杭州市只有电信有公网IP，移动、华数均不对家庭网络提供
- 💻有稳定长时间开机的设备
  - 可以是树莓派、NAS、小型主机等

## 用法

> 当前支持`腾讯云`、`阿里云`的域名解析，若有需求可提 issues

### 安装及启动

- Nodejs
  - 直接将代码 clone 到本地
  - 执行`npm install`安装依赖，执行`npm start`启动服务
- Docker
  - `docker pull yeqiyeluo/ddns`
  - `docker run -d -p 8000:8000 --name ddns yeqiyeluo/ddns`

### 登录控制页

- 访问`http://localhost:8000`

### 获取密钥

- [阿里云AccessKey查询](https://ram.console.aliyun.com/manage/ak)
- [腾讯云SecretId查询](https://console.cloud.tencent.com/cam/capi)

### 配置

- 将密钥、一级域名、二级域名记录填写好，启用改为 Y
- 点击`保存配置`，可点击`查询域名信息`查询当前域名信息，无记录返回`0.0.0.0`
- 点击`启动DDNS`

## 摘要

- [阿里云云解析API](https://help.aliyun.com/document_detail/29776.html)

## 未来功能

- 变更后邮件通知
- 当查询不到时，提示用户是否需要创建(目前强制创建)
- 支持查询域名列表管理域名