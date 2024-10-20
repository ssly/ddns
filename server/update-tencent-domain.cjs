const tencentcloud = require('tencentcloud-sdk-nodejs')
const DnspodClient = tencentcloud.dnspod.v20210323.Client
const { getTimeString } = require('./date.cjs')

/**
 * 获取配置文件参数
 * @returns {object}
 */
const getClient = (config) => {
  const { id: secretId, secret: secretKey } = config
  return new DnspodClient({
    credential: { secretId, secretKey },
    region: '',
    profile: {
      httpProfile: { endpoint: 'dnspod.tencentcloudapi.com' },
    },
  })
}

function createDomain(config) {
  const ip = '0.0.0.0'
  const { RR, domain } = config
  return new Promise((resolve) => {
    getClient(config)
      .request(
        'CreateRecord',
        {
          Domain: domain,
          SubDomain: RR,
          RecordType: 'A',
          RecordLine: '默认',
          Value: ip,
        },
        { method: 'POST' }
      )
      .then(
        (result) => {
          console.log(getTimeString(), '创建腾讯云解析成功', JSON.stringify(result))
          resolve({ ip, recordId: result.RecordId })
        },
        (error) => {
          console.error(getTimeString(), '创建腾讯云解析失败', error)
          resolve({ error: error.data.Message })
        }
      )
  })
}

module.exports = {
  queryDomainRecord(config) {
    const { RR, domain } = config
    return new Promise((resolve) => {
      getClient(config)
        .request(
          'DescribeRecordList',
          {
            Domain: domain,
            Subdomain: RR,
            RecordType: 'A',
          },
          {
            method: 'POST',
          }
        )
        .then(
          (result) => {
            const current = result.RecordList.filter((v) => v.Name === RR)[0]
            console.log(getTimeString(), '查询腾讯云解析成功', JSON.stringify(result))
            if (current) {
              resolve({ ip: current.Value, recordId: current.RecordId })
            } else {
              createDomain(config).then((res) => resolve(res))
            }
          },
          (error) => {
            console.error(getTimeString(), '查询腾讯云解析失败', error.code)
            if (error.code === 'AuthFailure.SecretIdNotFound') {
              resolve({ error: '密钥错误，请检查' })
              return
            } else if (error.code === 'InvalidParameter.DomainIdInvalid') {
              resolve({ error: '域名不存在' })
              return
            }

            // 如果没有查到记录，就创建一个
            if (error.code === 'ResourceNotFound.NoDataOfRecord') {
              createDomain(config).then((res) => resolve(res))
            }
          }
        )
    })
  },

  updateDomainRecord(config, Value, RecordId) {
    const { RR, domain } = config
    const options = [
      {
        Domain: domain,
        SubDomain: RR,
        Value,
        RecordId,
        RecordLine: '默认',
        RecordType: 'A',
      },
    ]

    options.forEach((params) => {
      console.log(getTimeString(), '腾讯updateDomainRecord', JSON.stringify(params))
      getClient(config)
        .request('ModifyRecord', params, {
          method: 'POST',
        })
        .then(
          (result) => {
            console.log(getTimeString(), '腾讯云解析修改成功', JSON.stringify(result))
          },
          (error) => {
            console.error(getTimeString(), '腾讯云解析修改失败', error)
          }
        )
    })
  },
}
