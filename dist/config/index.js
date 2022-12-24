module.exports = {
  accessKeyId: '', // 阿里云key
  accessKeySecret: '', // 阿里云key
  credential: {
    secretId: "SecretId",
    secretKey: "SecretKey",
  },
  region: "",
  profile: {
    httpProfile: {
      endpoint: "dnspod.tencentcloudapi.com",
    },
  }, // 腾讯云相关
  RR: '', // 二级域名，例如 www
  domain: '', // 一级域名，例如 google.com
}