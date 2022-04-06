const Core = require('@alicloud/pop-core')
const { accessKeyId, accessKeySecret, RR, domain } = require('./config/index')
const { getTimeString } = require('./date')

var client = new Core({
  accessKeyId,
  accessKeySecret,
  endpoint: 'https://alidns.cn-hangzhou.aliyuncs.com',
  apiVersion: '2015-01-09'
});

module.exports = {
  queryDomainRecord() {
    return new Promise(resolve => {
      client.request('DescribeDomainRecords', {
        DomainName: domain,
        SearchMode: 'EXACT',
        KeyWord: RR,        
      }, {
        method: 'POST',
      }).then((result) => {
        // 查到精确的那条，经测试，阿里云返回的result.DomainRecords.Record是数组
        const current = result.DomainRecords.Record.filter(v => v.RR === RR)[0]
        console.log(getTimeString(), '查询阿里云解析成功', JSON.stringify(result))
        if (current) {
          resolve({ ip: current.Value, recordId: current.RecordId })
        } else {
          // 未查到记录，创建阿里云解析
          const ip = '0.0.0.0'
          client.request('AddDomainRecord', {
            DomainName: domain,
            RR,
            Type: 'A',
            Value: ip,
          }, { method: 'POST' }).then((result) => {
            console.log(getTimeString(), '创建阿里云解析成功', JSON.stringify(result))
            resolve({ ip, recordId: result.RecordId })
          }, (ex) => {
            console.error(getTimeString(), '创建阿里云解析失败', ex)
            resolve({})
          })
        }
      }, (ex) => {
        console.error(getTimeString(), '查询阿里云解析失败', ex)
        resolve({})
      })
    })
  },
  updateDomainRecord(Value, RecordId) {
    const options = [
      { Value, Type: 'A', RR, RecordId },
    ]

    options.forEach(params => {
      client.request('UpdateDomainRecord', params, {
        method: 'POST'
      }).then((result) => {
        console.log(getTimeString(), '阿里云解析修改成功', JSON.stringify(result))
      }, (ex) => {
        console.error(getTimeString(), '阿里云解析修改失败', ex)
      })
    })
  }
}

