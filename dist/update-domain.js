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
  queryDomainRecord() {
    const params = {
       RecordId: '739142052571687936',
    }
    return new Promise(resolve => {
      client.request('DescribeDomainRecordInfo', params, {
        method: 'POST',
      }).then((result) => {
        console.log(getTimeString(), '查询lius.me解析成功', JSON.stringify(result));
        resolve(result.Value);
      }, (ex) => {
        console.error(getTimeString(), '查询lius.me解析失败', ex);
        resolve('');
      })
    })
  },
  updateDomainRecord(ip) {
    const options = [
      { Value: ip, Type: 'A', RR: 'nas', RecordId:  '739142052571687936' },
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

