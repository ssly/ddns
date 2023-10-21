const tencentcloud = require('tencentcloud-sdk-nodejs')
const DnspodClient = tencentcloud.dnspod.v20210323.Client
const { getTimeString } = require('./date')


/**
 * 获取配置文件参数
 * @returns {object}
 */
const getConfig = () => {
  const fs = require('fs')
  const yaml = require('js-yaml')
  const path = require('path')
  
  return yaml.load(
    fs.readFileSync(path.join(__dirname, 'config/index.yml'), { encoding: 'utf8' })
  )
}

const getClient = () => {
  const { tencent: { secretId, secretKey } } = getConfig()
  return new DnspodClient({
    credential: { secretId, secretKey },
    region: '',
    profile: {
      httpProfile: { endpoint: 'dnspod.tencentcloudapi.com' },
    },
  })
}

function createDomain() {
  const ip = '0.0.0.0'
  const { tencent: { RR, domain } } = getConfig()
  return new Promise(resolve => {
    getClient().request('CreateRecord', {
      Domain: domain,
      SubDomain: RR,
      RecordType: 'A',
      RecordLine: '默认',
      Value: ip,
    }, { method: 'POST' }).then((result) => {
      console.log(getTimeString(), '创建腾讯云解析成功', JSON.stringify(result))
      resolve({ ip, recordId: result.RecordId })
    }, (error) => {
      console.error(getTimeString(), '创建腾讯云解析失败', error)
      resolve({})
    })
  })
}

module.exports = {
  queryDomainRecord() {
    const { tencent: { RR, domain } } = getConfig()
    return new Promise(resolve => {
      getClient().request('DescribeRecordList', {
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
      }, (error) => {
        console.error(getTimeString(), '查询腾讯云解析失败', error.code)
        if (error.code === 'AuthFailure.SecretIdNotFound') {
          resolve({ error: '密钥错误，请检查' })
          return
        }
        
        // 如果没有查到记录，就创建一个
        if (error.code === 'ResourceNotFound.NoDataOfRecord') {
          createDomain().then(res => resolve(res))
        }
      })
    })
  },

  updateDomainRecord(Value, RecordId) {
    const { tencent: { RR, domain } } = getConfig()
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
      getClient().request('ModifyRecord', params, {
        method: 'POST'
      }).then((result) => {
        console.log(getTimeString(), '腾讯云解析修改成功', JSON.stringify(result))
      }, (error) => {
        console.error(getTimeString(), '腾讯云解析修改失败', error)
      })
    })
  }
}

