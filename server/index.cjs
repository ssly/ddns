const getIP = require('external-ip')()
const url = require('url')
const http = require('http')
const schedule = require('node-schedule')
const { getJSON, setJSON, handleStaticFile, parseRequestBody } = require('./utils.cjs')
const { updateDomainRecord, queryDomainRecord } = require('./update-domain.cjs')
const {
  updateDomainRecord: updateTencentDomainRecord,
  queryDomainRecord: queryTencentDomainRecord,
} = require('./update-tencent-domain.cjs')
const { getTimeString } = require('./date.cjs')

const PORT = 8000

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

  async query(key) {
    if (key === 'ali') {
      const { error, ip = '', recordId = '' } = await queryDomainRecord(getJSON().ali)
      console.log(`阿里: 查询当前信息, ip: ${ip}、recordId: ${recordId}, error: ${error}`)
      currentAliInfo.publicIP = ip
      currentAliInfo.recordId = recordId
      return { error, ip, recordId, timestamp: Date.now() }
    }

    if (key === 'tencent') {
      const { error, ip = '', recordId = '' } = await queryTencentDomainRecord(getJSON().tencent)
      console.log(`腾讯: 查询当前信息, ip: ${ip}、recordId: ${recordId}、error: ${error}`)
      currentTencentInfo.publicIP = ip
      currentTencentInfo.recordId = recordId
      return { error, ip, recordId, timestamp: Date.now() }
    }
  },

  startScheduleJob(config) {
    // 先停了
    this.stopScheduleJob()
    this.instance = schedule.scheduleJob(this.recon, () => {
      console.log('startScheduleJob scheduleJob')
      // 获取公网IP
      return getIP((err, ip) => {
        if (err) {
          console.log('获取公网IP失败')
          return
        }
        console.log('当前IP是', currentTencentInfo.publicIP, ip)
        if (config.ali.enable && currentAliInfo.publicIP !== ip) {
          console.log(getTimeString(), '阿里：本地外网IP变化', `${currentAliInfo.publicIP}->${ip}`)
          currentAliInfo.publicIP = ip
          updateDomainRecord(currentAliInfo.publicIP, currentAliInfo.recordId)
        }

        if (config.tencent.enable && currentTencentInfo.publicIP !== ip) {
          console.log(getTimeString(), '腾讯：本地外网IP变化', `${currentTencentInfo.publicIP}->${ip}`)
          currentTencentInfo.publicIP = ip
          updateTencentDomainRecord(getJSON().tencent, currentTencentInfo.publicIP, currentTencentInfo.recordId)
        }
      })
    })
  },
  stopScheduleJob() {
    console.log('stopScheduleJob')
    if (this.instance) {
      this.instance.cancel()
      this.instance = null
    }
  },
}

// 创建 HTTP 服务器
const server = http.createServer(async (req, res) => {
  console.log(`请求方法: ${req.method}, 请求 URL: ${req.url}`)
  const parsedUrl = url.parse(req.url, true)
  const pathname = parsedUrl.pathname

  // 处理 API 路径
  if (pathname.startsWith('/api/')) {
    if (pathname === '/api/queryData') {
      const requestBody = await parseRequestBody(req)
      const data = await scheduleJob.query(requestBody.key)
      res.statusCode = 200
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify(data))
    } else if (pathname === '/api/getConfig') {
      res.statusCode = 200
      res.setHeader('Content-Type', 'application/json')
      res.end(
        JSON.stringify({
          isRunning: !!scheduleJob.instance,
          ...getJSON(),
        })
      )
    } else if (pathname === '/api/updateTencentConfig') {
      const requestBody = await parseRequestBody(req)
      const config = getJSON()
      config.tencent = requestBody
      setJSON(config)
      res.statusCode = 200
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ message: '更新成功' }))
    } else if (pathname === '/api/updateAliConfig') {
      const requestBody = await parseRequestBody(req)
      const config = getJSON()
      config.ali = requestBody
      setJSON(config)
      res.statusCode = 200
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ message: '更新成功' }))
    } else if (pathname === '/api/changeDDNSStatus') {
      const requestBody = await parseRequestBody(req)
      if (requestBody.status) {
        await scheduleJob.startScheduleJob(getJSON())
      } else {
        scheduleJob.stopScheduleJob()
      }
      res.statusCode = 200
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ message: '操作成功' }))
    }
  } else {
    handleStaticFile(req, res, req.url)
  }
})

// 启动服务器
server.listen(PORT, () => {
  console.log(`服务器正在运行，访问：http://localhost:${PORT}`)

  // 第一次先设置
  const config = getJSON()
  if (config.tencent.enable) {
    scheduleJob.query('tencent')
  }
  if (config.ali.enable) {
    scheduleJob.query('ali')
  }
})
