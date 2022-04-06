# DDNS - 基于 Nodejs & 阿里云域名

## 用途

- 给有动态公网IP的家庭网络使用

## 前提

- 🕸️家庭网络需要有动态公网IP
  - 如果有静态公网IP，你可以直接域名解析使用了🐒
  - 目前杭州市只有电信有公网IP，移动、华数均不对家庭网络提供
- 域名是阿里云购入的
  - 其他域名运营商的方式类似，可自行修改代码，或邮箱联系帮忙加入
- 有稳定长时间开机的设备
  - 可以是树莓派、NAS、小型主机等

## 用法

- 阿里云域名处获取`accessKeyId`、`accessKeySecret`补充到`dist/config/index.js`
- 默认绑定的一级域名(domain)、二级域名为(RR)需要在`dist/config/index.js`内修改

## 摘要

- [阿里云云解析API](https://help.aliyun.com/document_detail/29776.html)