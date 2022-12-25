module.exports = {
  ali: {
    accessKeyId: '', // 阿里云key
    accessKeySecret: '', // 阿里云key
    RR: '', // 二级域名，例如 www
    domain: '', // 一级域名，例如 google.com
  },
  tencent: {
    credential: {
      secretId: "AKIDfJvU0okjqy38JTYYTMCygWIybFoMvRsf",
      secretKey: "pfXzsldSbn2Y6c5Rr8Neox8NiDjF1obF",
    },
    RR: '', // 二级域名，例如 www
    domain: 'sifengyi.com', // 一级域名，例如 google.com
    region: "",
    profile: {
      httpProfile: {
        endpoint: "dnspod.tencentcloudapi.com",
      },
    }, // 腾讯云相关
  }
}