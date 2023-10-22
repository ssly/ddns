const publicIp = require('public-ip')
const schedule = require('node-schedule')
const { updateDomainRecord, queryDomainRecord } = require('./update-domain')
const { updateDomainRecord: updateTencentDomainRecord, queryDomainRecord: queryTencentDomainRecord } = require('./update-tencent-domain')
const { getTimeString } = require('./date')

const http = require('http');
const path = require('path');
const fs = require('fs');
const url = require('url');
const querystring = require('querystring');
const yaml = require('js-yaml');

// 用于存储配置项的对象
const config = {
  ali: {},
  tencent: {}
};

let currentAliInfo = {
  publicIP: '',
  recordId: '', // 阿里云里需要绑定域名的recordId
}

let currentTencentInfo = {
  publicIP: '',
  recordId: '', // 腾讯云里需要绑定域名的recordId
}

const scheduleJob = {
  instance: null,
  recon: '0,20,40 * * * * *',

  async query(config) {
    let ali = null
    if (config.ali.enabled === 'Y') {
      ali = await queryDomainRecord().then(({ error, ip = '', recordId = '' }) => {
        console.log(`阿里: 查询当前信息, ip: ${ip}、recordId: ${recordId}, error: ${error}`)
        currentAliInfo.publicIP = ip
        currentAliInfo.recordId = recordId
        return { error, ip, recordId }
      });
    }

    console.log('config.tencent.enabled', config.tencent.enabled)
    let tencent = null
    if (config.tencent.enabled === 'Y') {
      tencent = await queryTencentDomainRecord().then(({ error, ip = '', recordId = '' }) => {
        console.log(`腾讯: 查询当前信息, ip: ${ip}、recordId: ${recordId}、error: ${error}`)
        currentTencentInfo.publicIP = ip
        currentTencentInfo.recordId = recordId
        return { error, ip, recordId }
      });
    }

    return { ali, tencent }
  },

  startScheduleJob(config) {
    this.instance = schedule.scheduleJob(this.recon, () => {
      // 获取公网IP
      publicIp.v4().then(ip => {
        console.log('当前IP是', currentTencentInfo.publicIP, ip)
        if (config.ali.enabled === 'Y' && currentAliInfo.publicIP !== ip) {
          console.log(getTimeString(), '阿里：本地外网IP变化', `${currentAliInfo.publicIP}->${ip}`)
          currentAliInfo.publicIP = ip
          updateDomainRecord(currentAliInfo.publicIP, currentAliInfo.recordId)
        }
        
        if (config.tencent.enabled === 'Y' && currentTencentInfo.publicIP !== ip) {
          console.log(getTimeString(), '腾讯：本地外网IP变化', `${currentTencentInfo.publicIP}->${ip}`)
          currentTencentInfo.publicIP = ip
          updateTencentDomainRecord(currentTencentInfo.publicIP, currentTencentInfo.recordId)
        }
      })
    });
  },
  stopScheduleJob() {
    this.instance.cancel();
  }
}

// 创建 HTTP 服务器
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url);
  const pathname = parsedUrl.pathname;
  const config = yaml.load(fs.readFileSync(path.join(__dirname, 'config/index.yml'), 'utf8'));
  if (req.method === 'GET' && pathname === '/') {
    // 如果是 GET 请求并且访问根路径
    res.writeHead(200, { 'Content-Type': 'text/html' });
    const indexPath = path.join(__dirname, './config/index.html')
    const html = fs.readFileSync(indexPath, 'utf8');

    const htmlWithConfig = html.replace(/%ali_enabled%/g, config.ali.enabled)
      .replace(/%ali_accessKeyId%/g, config.ali.accessKeyId)
      .replace(/%ali_accessKeySecret%/g, config.ali.accessKeySecret)
      .replace(/%ali_RR%/g, config.ali.RR)
      .replace(/%ali_domain%/g, config.ali.domain)
      .replace(/%tencent_enabled%/g, config.tencent.enabled)
      .replace(/%tencent_secretId%/g, config.tencent.secretId)
      .replace(/%tencent_secretKey%/g, config.tencent.secretKey)
      .replace(/%tencent_RR%/g, config.tencent.RR)
      .replace(/%tencent_domain%/g, config.tencent.domain)

    res.end(htmlWithConfig);
  } else if (req.method === 'POST' && pathname === '/save-config') {
    // 如果是 POST 请求并且访问保存配置路径
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      const parsedBody = querystring.parse(body);

      // 更新配置项
      config.ali.enabled = parsedBody.ali_enabled;
      config.ali.accessKeyId = parsedBody.ali_accessKeyId;
      config.ali.accessKeySecret = parsedBody.ali_accessKeySecret;
      config.ali.RR = parsedBody.ali_RR;
      config.ali.domain = parsedBody.ali_domain;
      config.tencent.enabled = parsedBody.tencent_enabled;
      config.tencent.secretId = parsedBody.tencent_secretId;
      config.tencent.secretKey = parsedBody.tencent_secretKey;
      config.tencent.RR = parsedBody.tencent_RR;
      config.tencent.domain = parsedBody.tencent_domain;

      // 把config写入 config/index.yml中
      fs.writeFileSync(path.join(__dirname, 'config/index.yml'), yaml.dump(config));

      // 重定向到根路径
      res.writeHead(302, { Location: '/' });
      res.end();
    });
  } else if (req.method === 'GET' && pathname === '/query-domain') {
    const response = await scheduleJob.query(config)
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(response));
  } else if (req.method === 'POST' && pathname === '/start-ddns') {
    await scheduleJob.query(config)
    await scheduleJob.startScheduleJob(config)
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end('启动成功');
  } else if (req.method === 'POST' && pathname === '/stop-ddns') {
    await scheduleJob.stopScheduleJob()
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end('停止成功');
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

server.listen(8000, () => {
  console.log('Server is running at http://localhost:8000');
});