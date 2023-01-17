const publicIp = require('public-ip')
const schedule = require('node-schedule')
const { updateDomainRecord, queryDomainRecord } = require('./update-tencent-domain')
const { updateDomainRecord: updateTencentDomainRecord, queryDomainRecord: queryTencentDomainRecord } = require('./update-tencent-domain')
const { getTimeString } = require('./date')

let currentAliInfo = {
  publicIP: '',
  recordId: '', // 阿里云里需要绑定域名的recordId
}

let currentTencentInfo = {
  publicIP: '',
  recordId: '', // 腾讯云里需要绑定域名的recordId
}

// 查询当前域名解析的IP设为当前值
queryDomainRecord().then(({ ip = '', recordId = '' }) => {
  console.log(`阿里：查询当前信息，ip: ${ip}、recordId: ${recordId}`)
  currentAliInfo.publicIP = ip
  currentAliInfo.recordId = recordId
});

queryTencentDomainRecord().then(({ ip = '', recordId = '' }) => {
  console.log(`腾讯：查询当前信息，ip: ${ip}、recordId: ${recordId}`)
  currentTencentInfo.publicIP = ip
  currentTencentInfo.recordId = recordId
});

schedule.scheduleJob('0,20,40 * * * * *', () => {
  // 获取公网IP
  publicIp.v4().then(ip => {
    if (currentAliInfo.publicIP !== ip) {
      console.log(getTimeString(), '阿里：本地外网IP变化', `${currentAliInfo.publicIP}->${ip}`)
      currentAliInfo.publicIP = ip
      updateDomainRecord(currentAliInfo.publicIP, currentAliInfo.recordId)
    }
    
    if (currentTencentInfo.publicIP !== ip) {
      console.log(getTimeString(), '腾讯：本地外网IP变化', `${currentTencentInfo.publicIP}->${ip}`)
      currentTencentInfo.publicIP = ip
      updateTencentDomainRecord(currentTencentInfo.publicIP, currentTencentInfo.recordId)
    }
  })
});
