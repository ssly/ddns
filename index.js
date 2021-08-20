const publicIp = require('public-ip')
const schedule = require('node-schedule');
const { updateDomainRecord } = require('./update-domain');

let currentPublicIP = '';

schedule.scheduleJob('30 * * * * *', () => {
    // 获取公网IP
    publicIp.v4().then(ip => {
        console.log(Date.now(), 'IP比对', currentPublicIP, ip);
        if (currentPublicIP === ip) {
            return;
        }

        currentPublicIP = ip;

        const options = [
            { Value: ip, Type: 'A', RR: '@', RecordId: '3496792216816640' },
            { Value: ip, Type: 'A', RR: 'www', RecordId:  '3496792385999872' }
        ]

        console.log(Date.now(), '修改阿里云参数为', JSON.stringify(options));

        // 修改阿里云解析
        updateDomainRecord(options);
    })
});


