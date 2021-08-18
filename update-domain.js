const Core = require('@alicloud/pop-core');

const { accessKeyId, accessKeySecret } = require('./config/index')

var client = new Core({
  accessKeyId,
  accessKeySecret,
  endpoint: 'https://alidns.cn-hangzhou.aliyuncs.com',
  apiVersion: '2015-01-09'
});

module.exports = {
    updateDomainRecord(options = []) {
        options.forEach(params => {
            client.request('UpdateDomainRecord', params, {
                method: 'POST'
            }).then((result) => {
              console.log('阿里云IP修改成功', JSON.stringify(result));
            }, (ex) => {
              console.error('阿里云IP修改失败', ex);
            })
        })
    }
}

