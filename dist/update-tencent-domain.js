const tencentcloud = require('tencentcloud-sdk-nodejs')
const DnspodClient = tencentcloud.dnspod.v20210323.Client;
const { tencent: { credential, region, profile, RR, domain } } = require('./config/index')
const { getTimeString } = require('./date')

const client = new DnspodClient({
  credential,
  region,
  profile,
  RR,
  domain
});

module.exports = {
  queryDomainRecord() {
    return new Promise(resolve => {
      client.request('DescribeRecordList', {
        Domain: domain,
        DomainId: null,
        Subdomain: null,
        RecordType: 'A',
        RecordLine: null,
        RecordLineId: null,
        GroupId: null,
        Keyword: null,
        SortField: null,
        SortType: null,
        Offset: null,
        Limit: null   
      }, {
        method: 'POST',
      }).then((result) => {
        // 查到精确的那条，经测试，阿里云返回的result.DomainRecords.Record是数组
        const current = result.RecordList.filter(v => v.name === RR)[0]
        console.log(getTimeString(), '查询腾讯云解析成功', JSON.stringify(result))
        if (current) {
          resolve({ ip: current.Value, recordId: current.RecordId })
        } else {
          // 未查到记录，创建腾讯云解析
          const ip = '0.0.0.0'
          client.request('CreateRecord', {
            "Domain": domain,
            "DomainId": null,
            "SubDomain": null,
            "RecordType": "A",
            "RecordLine": "默认",
            "RecordLineId": null,
            "Value": ip,
            "MX": null,
            "TTL": null,
            "Weight": null,
            "Status": null
          }, { method: 'POST' }).then((result) => {
            console.log(getTimeString(), '创建腾讯云解析成功', JSON.stringify(result))
            resolve({ ip, recordId: result.RecordId })
          }, (ex) => {
            console.error(getTimeString(), '创建腾讯云解析失败', ex)
            resolve({})
          })
        }
      }, (ex) => {
        console.error(getTimeString(), '查询腾讯云解析失败', ex)
        resolve({})
      })
    })
  },
  updateDomainRecord(Value, RecordId) {
    const options = [
      {
        Domain: domain,
        DomainId: null,
        SubDomain: null,
        RecordType: "A",
        RecordLine: "默认",
        RecordLineId: null,
        Value,
        MX: null,
        TTL: null,
        Weight: null,
        Status: null,
        RecordId
      }
    ]

    options.forEach(params => {
      client.request('ModifyRecord', params, {
        method: 'POST'
      }).then((result) => {
        console.log(getTimeString(), '腾讯云解析修改成功', JSON.stringify(result))
      }, (ex) => {
        console.error(getTimeString(), '腾讯云解析修改失败', ex)
      })
    })
  }
}

