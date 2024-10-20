const Core = require('@alicloud/pop-core')
const { getTimeString } = require('./date.cjs')

const getClient = (config) => {
  const { id: accessKeyId, secret: accessKeySecret } = config
  return new Core({
    accessKeyId,
    accessKeySecret,
    endpoint: 'https://alidns.cn-hangzhou.aliyuncs.com',
    apiVersion: '2015-01-09',
  })
}

module.exports = {
  queryDomainRecord(config) {
    const { RR, domain } = config
    return new Promise((resolve) => {
      getClient(config)
        .request(
          'DescribeDomainRecords',
          {
            DomainName: domain,
            SearchMode: 'EXACT',
            KeyWord: RR,
          },
          {
            method: 'POST',
          }
        )
        .then(
          (result) => {
            // 查到精确的那条，经测试，阿里云返回的result.DomainRecords.Record是数组
            const current = result.DomainRecords.Record.filter((v) => v.RR === RR)[0]
            console.log(getTimeString(), '查询阿里云解析成功', JSON.stringify(result))
            if (current) {
              resolve({ ip: current.Value, recordId: current.RecordId })
            } else {
              // 未查到记录，创建阿里云解析
              const ip = '0.0.0.0'
              getClient(config)
                .request(
                  'AddDomainRecord',
                  {
                    DomainName: domain,
                    RR,
                    Type: 'A',
                    Value: ip,
                  },
                  { method: 'POST' }
                )
                .then(
                  (result) => {
                    console.log(getTimeString(), '创建阿里云解析成功', JSON.stringify(result))
                    resolve({ ip, recordId: result.RecordId })
                  },
                  (error) => {
                    if (error.code === 'InvalidAccessKeyId') {
                      resolve({ error: '密钥错误，请检查' })
                      return
                    }
                    console.error(getTimeString(), '创建阿里云解析失败', error)
                    resolve({ error: error.data.Message })
                  }
                )
            }
          },
          (error) => {
            if (error.data.Code === 'InvalidAccessKeyId') {
              resolve({ error: '密钥错误，请检查' })
              return
            } else if (error.data.Code === 'InvalidAccessKeyId.NotFound') {
              resolve({ error: '域名不存在' })
              return
            }
            console.error(getTimeString(), '查询阿里云解析失败', error.data.Code)
            resolve({ error: error.data.Message })
          }
        )
    })
  },
  updateDomainRecord(config, Value, RecordId) {
    const options = [{ Value, Type: 'A', RR, RecordId }]

    options.forEach((params) => {
      console.log(getTimeString(), '阿里updateDomainRecord', JSON.stringify(params))
      getClient(config)
        .request('UpdateDomainRecord', params, {
          method: 'POST',
        })
        .then(
          (result) => {
            console.log(getTimeString(), '阿里云解析修改成功', JSON.stringify(result))
          },
          (error) => {
            console.error(getTimeString(), '阿里云解析修改失败', error)
          }
        )
    })
  },
}
