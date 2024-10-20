const fs = require('fs')
const path = require('path')
const https = require('https')

function getIp() {
  return new Promise((resolve) => {
    https.get('https://api.ipify.org/', (res) => {
      if (res.statusCode !== 200) {
        resolve('')
      }
      res.on('data', (d) => {
        const ip = d.toString().trim()
        resolve(ip)
      })
    })
  })
}

function getJSON() {
  // 返回 config/index.json 文件内容的最新内容
  try {
    const config = fs.readFileSync(path.join(__dirname, './data.json'), 'utf8')
    return JSON.parse(config)
  } catch (error) {
    console.error('读取 data.json 文件失败', error)
    return {}
  }
}
function setJSON(json) {
  // 将 json 写入 config/index.json 文件，要格式化
  fs.writeFileSync(path.join(__dirname, './data.json'), JSON.stringify(json, null, 2))
}

function parseRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', (chunk) => {
      body += chunk.toString()
      // 防止请求体过大
      if (body.length > 1e6) {
        // ~1MB
        req.connection.destroy()
        reject(new Error('请求体过大'))
      }
    })
    req.on('end', () => {
      try {
        const contentType = req.headers['content-type']
        if (contentType === 'application/json') {
          resolve(JSON.parse(body))
        } else if (contentType === 'application/x-www-form-urlencoded') {
          const parsed = {}
          body.split('&').forEach((pair) => {
            const [key, value] = pair.split('=')
            parsed[decodeURIComponent(key)] = decodeURIComponent(value || '')
          })
          resolve(parsed)
        } else {
          resolve(body)
        }
      } catch (err) {
        reject(err)
      }
    })
  })
}

/**
 * 处理静态文件
 * @param {*} req
 * @param {*} res
 * @param {*} url
 * @returns
 */
function handleStaticFile(req, res, url) {
  // 定义 MIME 类型映射
  const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.svg': 'image/svg+xml',
    // 可以根据需要添加更多类型
  }
  // 处理根路径
  let filePath = url === '/' ? '/index.html' : url

  // 解析文件扩展名
  const extname = String(path.extname(filePath)).toLowerCase()
  const contentType = mimeTypes[extname] || 'application/octet-stream'

  // 构建文件的完整路径
  const fullPath = path.join(__dirname, '../client', filePath)

  // 检查文件是否存在
  fs.access(fullPath, fs.constants.F_OK, (err) => {
    if (err) {
      // 文件不存在，返回 404
      res.statusCode = 404
      res.setHeader('Content-Type', 'text/plain')
      res.end('404 Not Found')
      return
    }

    // 读取文件并返回
    fs.readFile(fullPath, (error, content) => {
      if (error) {
        // 读取文件出错，返回 500
        res.statusCode = 500
        res.setHeader('Content-Type', 'text/plain')
        res.end('500 Internal Server Error')
      } else {
        // 设置正确的 Content-Type 并返回文件内容
        res.statusCode = 200
        res.setHeader('Content-Type', contentType)
        res.end(content, 'utf-8')
      }
    })
  })
}

module.exports = {
  getIp,
  getJSON,
  setJSON,
  parseRequestBody,
  handleStaticFile,
}
