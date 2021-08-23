const Core = require('@alicloud/pop-core');

const { accessKeyId, accessKeySecret } = require('./config/index');
const { getTimeString } = require('./date');

var client = new Core({
  accessKeyId,
  accessKeySecret,
  endpoint: 'https://alidns.cn-hangzhou.aliyuncs.com',
  apiVersion: '2015-01-09'
});

module.exports = {
  updateDomainRecord(ip) {
    const options = [
      { Value: ip, Type: 'A', RR: 'site', RecordId:  '3496792385999872' }
    ]

    options.forEach(params => {
      client.request('UpdateDomainRecord', params, {
        method: 'POST'
      }).then((result) => {
        console.log(getTimeString(), '阿里云IP修改成功', JSON.stringify(result));
      }, (ex) => {
        console.error(getTimeString(), '阿里云IP修改失败', ex);
      })
    })
  }
}

