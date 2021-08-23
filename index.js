const publicIp = require('public-ip')
const schedule = require('node-schedule');
const { updateDomainRecord } = require('./update-domain');
const { getTimeString } = require('./date');

let currentPublicIP = '';

schedule.scheduleJob('30 * * * * *', () => {
    // 获取公网IP
    publicIp.v4().then(ip => {
        if (currentPublicIP === ip) {
            return;
        }
        console.log(getTimeString, 'IP变化', `${currentPublicIP}->${ip}`)

        currentPublicIP = ip;
        // 修改阿里云lius.me解析
        updateDomainRecord(currentPublicIP);
    })
});


