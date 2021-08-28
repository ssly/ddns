const publicIp = require('public-ip')
const schedule = require('node-schedule');
const { updateDomainRecord, queryDomainRecord } = require('./update-domain');
const { getTimeString } = require('./date');

let currentPublicIP = '';

// 查询当前域名解析的IP设为当前值
queryDomainRecord().then(ip => {
  currentPublicIP = ip;
});

schedule.scheduleJob('30 * * * * *', () => {
    // 获取公网IP
    publicIp.v4().then(ip => {
        if (currentPublicIP === ip) {
            return;
        }
        console.log(getTimeString(), 'IP变化', `${currentPublicIP}->${ip}`)

        currentPublicIP = ip;
        // 修改阿里云lius.me解析
        updateDomainRecord(currentPublicIP);
    })
});


