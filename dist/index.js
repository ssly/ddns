const publicIp = require('public-ip')
const schedule = require('node-schedule')
const { updateDomainRecord, queryDomainRecord } = require('./update-domain')
const { getTimeString } = require('./date')
let currentPublicIP = ''
let currentRecordId = '' // 阿里云里需要绑定域名的recordId
// 查询当前域名解析的IP设为当前值
queryDomainRecord().then(({ ip = '', recordId = '' }) => {
  console.log(`查询当前信息，ip: ${ip}、recordId: ${recordId}`)
  currentPublicIP = ip
  currentRecordId = recordId
});
schedule.scheduleJob('0,20,40 * * * * *', () => {
  // 获取公网IP
  publicIp.v4().then(ip => {
    if (currentPublicIP === ip) {
      return
    }
    console.log(getTimeString(), '本地外网IP变化', `${currentPublicIP}->${ip}`)
    currentPublicIP = ip
    // 修改阿里云lius.me解析
    updateDomainRecord(currentPublicIP, currentRecordId)
  })
});