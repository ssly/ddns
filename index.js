const publicIp = require('public-ip')
const schedule = require('node-schedule');
const { updateDomainRecord } = require('./update-domain');

schedule.scheduleJob('2 * * *', function(){
    // 获取公网IP
    publicIp.v4().then(ip => {
        const options = [
            { Value: ip, Type: 'A', RR: '@', RecordId: '3496792216816640' },
            { Value: ip, Type: 'A', RR: 'www', RecordId:  '3496792385999872' }
        ]

        console.log('修改阿里云参数为', JSON.stringify(options));

        // 修改阿里云解析
        updateDomainRecord(options);
    })
});


