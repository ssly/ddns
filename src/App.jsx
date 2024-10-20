'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Activity } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function CloudDomainConfig() {
  const { toast } = useToast()
  const [aliConfig, setAliConfig] = useState({
    key: 'ali',
    enable: false,
    id: '',
    secret: '',
    RR: '',
    domain: '',
  })

  useEffect(() => {
    // 页面加载时获取配置
    fetch('/api/getConfig')
      .then((response) => response.json())
      .then((data) => {
        setAliConfig({
          ...data.ali,
          key: 'ali',
        })
        setTencentConfig({
          ...data.tencent,
          key: 'tencent',
        })
        setIsDDNSRunning(data.isRunning)
      })
      .catch((error) => console.error('Error fetching config:', error))
  }, []) // 空依赖数组，确保只在组件挂载时执行一次

  const [tencentConfig, setTencentConfig] = useState({
    key: 'tencent',
    enable: false,
    id: '',
    secret: '',
    RR: '',
    domain: '',
  })

  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogContent, setDialogContent] = useState({ title: '', description: '' })

  // 新增 DDNS 运行状态
  const [isDDNSRunning, setIsDDNSRunning] = useState(false)

  const showDialog = (title, description) => {
    setDialogContent({ title, description })
    setDialogOpen(true)
  }

  const handleSaveConfig = (key, enable) => {
    const fn = key === 'ali' ? setAliConfig : setTencentConfig
    const newConfig = {
      ...(key === 'ali' ? aliConfig : tencentConfig),
      enable,
    }
    fn(newConfig)

    const api = key === 'ali' ? '/api/updateAliConfig' : '/api/updateTencentConfig'
    fetch(api, {
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify(newConfig),
    })
  }

  const startDDNS = () => {
    fetch('/api/changeDDNSStatus', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: true }),
    })
      .then(() => {
        toast({
          duration: 1000,
          title: '启动DDNS',
          description: 'DDNS已成功启动！',
        })
        setIsDDNSRunning(true)
      })
      .catch((error) => console.error('Error changing DDNS status:', error))
  }

  const stopDDNS = () => {
    fetch('/api/changeDDNSStatus', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: false }),
    })
      .then(() => {
        toast({
          duration: 1000,
          title: '停止DDNS',
          description: 'DDNS已成功停止！',
        })
        setIsDDNSRunning(false)
      })
      .catch((error) => console.error('Error changing DDNS status:', error))
  }

  const testDomainInfo = (key) => {
    fetch('/api/queryData', {
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify({ key }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data)
        const message = data.error
          ? `错误: ${data.error}`
          : `域名解析IP: ${data.ip} \n更新时间: ${new Date(data.timestamp).toLocaleString()}`
        showDialog(`域名信息`, message)
      })
      .catch((error) => console.error('Error testing domain info:', error))
  }

  const renderCloudConfig = (config, setConfig) => (
    <Card className={`h-full ${config.enable ? 'ring-2 ring-primary' : ''}`}>
      <CardHeader>
        <CardTitle className="text-2xl">{config.key === 'ali' ? '阿里云' : '腾讯云'}域名配置</CardTitle>
        <CardDescription>{config.key === 'ali' ? '阿里云' : '腾讯云'}提供可靠的域名解析和管理服务。</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`${config.key}-id`}>AccessKeyId/SecretId</Label>
            <Input
              id={`${config.key}-id`}
              value={config.id}
              disabled={config.enable}
              onChange={(e) => setConfig({ ...config, id: e.target.value })}
              placeholder={`请输入${config.key === 'ali' ? '阿里云' : '腾讯云'} ID`}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${config.key}-secret`}>AccessKeySecret/SecretKey</Label>
            <Input
              id={`${config.key}-secret`}
              value={config.secret}
              disabled={config.enable}
              onChange={(e) => setConfig({ ...config, secret: e.target.value })}
              placeholder={`请输入${config.key === 'ali' ? '阿里云' : '腾讯云'} Secret`}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${config.key}-subDomain`}>二级域名</Label>
            <Input
              id={`${config.key}-subDomain`}
              value={config.RR}
              disabled={config.enable}
              onChange={(e) => setConfig({ ...config, RR: e.target.value })}
              placeholder="请输入二级域名"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${config.key}-domain`}>一级域名</Label>
            <Input
              id={`${config.key}-domain`}
              value={config.domain}
              disabled={config.enable}
              onChange={(e) => setConfig({ ...config, domain: e.target.value })}
              placeholder="请输入一级域名"
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="secondary" disabled={!config.enable} onClick={() => testDomainInfo(config.key)}>
          测试域名信息
        </Button>
        <Button
          onClick={() => handleSaveConfig(config.key, !config.enable)}
          variant={config.enable ? 'destructive' : 'default'}
        >
          {config.enable ? '停用' : '启用'}
        </Button>
      </CardFooter>
    </Card>
  )

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8 bg-gradient-to-b from-gray-50 to-white min-h-screen">
      <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">DDNS 配置</h1>

      <Alert className="mb-8">
        <Activity className="h-4 w-4" />
        <AlertTitle>DDNS 状态</AlertTitle>
        <AlertDescription>{isDDNSRunning ? `当前DDNS正在运行` : '当前DDNS未运行'}</AlertDescription>
      </Alert>

      <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-8">
        {isDDNSRunning ? (
          <Button onClick={stopDDNS} variant="outline" className="border-red-600 text-red-600 hover:bg-red-50">
            停止DDNS
          </Button>
        ) : (
          <Button onClick={startDDNS} className="bg-green-600 hover:bg-green-700">
            启动DDNS
          </Button>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {renderCloudConfig(aliConfig, setAliConfig)}

        {renderCloudConfig(tencentConfig, setTencentConfig)}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogContent.title}</DialogTitle>
            <DialogDescription>{dialogContent.description}</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  )
}
