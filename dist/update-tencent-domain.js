const tencentcloud = require('tencentcloud-sdk-nodejs')
const DnspodClient = tencentcloud.dnspod.v20210323.Client;
const { tencent: { credential, region, profile, RR, domain } } = require('./config/index')
const { getTimeString } = require('./date')

const client = new DnspodClient({
  credential,
  RR,
  domain,
  region: '',
  profile: {
    httpProfile: { endpoint: 'dnspod.tencentcloudapi.com' },
  },
});

function createDomain() {
  const ip = '0.0.0.0'
  return new Promise(resolve => {
    client.request('CreateRecord', {
      Domain: domain,
      SubDomain: RR,
      RecordType: 'A',
      RecordLine: '默认',
      Value: ip,
    }, { method: 'POST' }).then((result) => {
      console.log(getTimeString(), '创建腾讯云解析成功', JSON.stringify(result))
      resolve({ ip, recordId: result.RecordId })
    }, (ex) => {
      console.error(getTimeString(), '创建腾讯云解析失败', ex)
      resolve({})
    })
  })
}

module.exports = {
  queryDomainRecord() {
    return new Promise(resolve => {
      client.request('DescribeRecordList', {
        Domain: domain,
        Subdomain: RR,
        RecordType: 'A',
      }, {
        method: 'POST',
      }).then((result) => {
        const current = result.RecordList.filter(v => v.Name === RR)[0]
        console.log(getTimeString(), '查询腾讯云解析成功', JSON.stringify(result))
        if (current) {
          resolve({ ip: current.Value, recordId: current.RecordId })
        } else {
          createDomain().then(res => resolve(res))
        }
      }, (ex) => {
        console.error(getTimeString(), '查询腾讯云解析失败', ex)
        createDomain().then(res => resolve(res))
      })
    })
  },
  updateDomainRecord(Value, RecordId) {
    const options = [
      {
        Domain: domain,
        SubDomain: RR,
        Value,
        RecordId,
        RecordLine: '默认',
        RecordType: 'A',
      }
    ]

    options.forEach(params => {
      console.log(getTimeString(), '腾讯updateDomainRecord', JSON.stringify(params))
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

