import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '@/components/layout/Layout'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { withAuth } from '@/components/auth/ProtectedRoute'
import { batchService, reportService as dbReportService, testDataService } from '@/services/database'
import { reportService } from '@/services/report'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'
import { FileText, Calendar, Package, Download } from 'lucide-react'

const reportTypes = [
  { value: 'batch', label: '批次报告' },
  { value: 'daily', label: '日报' },
  { value: 'weekly', label: '周报' },
  { value: 'monthly', label: '月报' },
  { value: 'custom', label: '自定义报告' }
]

function GenerateReportPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    type: 'batch',
    batchId: router.query.batchId || '',
    dateRange: {
      start: '',
      end: ''
    }
  })
  const [batches, setBatches] = useState([])
  const [generating, setGenerating] = useState(false)
  const [previewData, setPreviewData] = useState(null)

  useEffect(() => {
    fetchBatches()
  }, [])

  useEffect(() => {
    // Auto-generate report name based on type
    const today = new Date()
    let name = ''
    
    switch (formData.type) {
      case 'batch':
        const batch = batches.find(b => b.id === formData.batchId)
        if (batch) {
          name = `批次报告_${batch.batch_number}`
        }
        break
      case 'daily':
        name = `日报_${today.toISOString().split('T')[0]}`
        break
      case 'weekly':
        name = `周报_第${Math.ceil(today.getDate() / 7)}周`
        break
      case 'monthly':
        name = `月报_${today.getFullYear()}年${today.getMonth() + 1}月`
        break
      default:
        name = '自定义报告'
    }
    
    setFormData(prev => ({ ...prev, name }))
  }, [formData.type, formData.batchId, batches])

  const fetchBatches = async () => {
    try {
      const { data } = await batchService.getAllBatches({
        page: 1,
        pageSize: 100,
        orderBy: 'created_at',
        ascending: false
      })
      setBatches(data)
    } catch (error) {
      toast.error('获取批次列表失败')
    }
  }

  const handleGenerate = async () => {
    if (!formData.name) {
      toast.error('请输入报告名称')
      return
    }
    
    if (formData.type === 'batch' && !formData.batchId) {
      toast.error('请选择批次')
      return
    }
    
    setGenerating(true)
    
    try {
      let pdf
      
      if (formData.type === 'batch') {
        // Generate batch report
        const batch = await batchService.getBatch(formData.batchId)
        const testData = await testDataService.getTestDataByBatch(formData.batchId)
        
        pdf = await reportService.generateBatchReport(batch, testData)
      } else {
        // For other report types, we would implement different logic
        toast.info('该报告类型正在开发中')
        setGenerating(false)
        return
      }
      
      // Save report to database
      const reportData = {
        name: formData.name,
        type: formData.type,
        batch_id: formData.type === 'batch' ? formData.batchId : null,
        date_range: formData.type !== 'batch' ? formData.dateRange : null,
        generated_by: user.id,
        status: 'completed',
        file_url: 'mock-url' // In production, this would be the actual uploaded file URL
      }
      
      await dbReportService.createReport(reportData)
      
      // Download the PDF
      reportService.savePDF(pdf, formData.name)
      
      toast.success('报告生成成功')
      router.push('/reports')
    } catch (error) {
      toast.error('报告生成失败: ' + error.message)
    } finally {
      setGenerating(false)
    }
  }

  const batchOptions = [
    { value: '', label: '请选择批次' },
    ...batches.map(batch => ({
      value: batch.id,
      label: `${batch.batch_number} - ${batch.device_model}`
    }))
  ]

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Page header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">生成报告</h1>
          <p className="text-gray-600 mt-1">选择报告类型并设置参数</p>
        </div>

        {/* Report configuration */}
        <Card>
          <div className="space-y-6">
            <Select
              label="报告类型"
              options={reportTypes}
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
            />
            
            {formData.type === 'batch' && (
              <Select
                label="选择批次"
                options={batchOptions}
                value={formData.batchId}
                onChange={(e) => setFormData(prev => ({ ...prev, batchId: e.target.value }))}
                required
              />
            )}
            
            {formData.type !== 'batch' && (
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="开始日期"
                  type="date"
                  value={formData.dateRange.start}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, start: e.target.value }
                  }))}
                  required
                />
                <Input
                  label="结束日期"
                  type="date"
                  value={formData.dateRange.end}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, end: e.target.value }
                  }))}
                  required
                />
              </div>
            )}
            
            <Input
              label="报告名称"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="输入报告名称"
              required
            />
          </div>
        </Card>

        {/* Preview section */}
        {formData.type === 'batch' && formData.batchId && (
          <Card title="报告预览">
            {(() => {
              const batch = batches.find(b => b.id === formData.batchId)
              if (!batch) return null
              
              return (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <Package className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">批次号</p>
                        <p className="font-medium">{batch.batch_number}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">设备型号</p>
                        <p className="font-medium">{batch.device_model}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">测试日期</p>
                        <p className="font-medium">{batch.test_date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-5 w-5 rounded-full bg-success-600" />
                      <div>
                        <p className="text-sm text-gray-600">合格率</p>
                        <p className="font-medium">{batch.pass_rate}%</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
                    报告将包含该批次的所有测试数据、统计信息和详细分析
                  </div>
                </div>
              )
            })()}
          </Card>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => router.push('/reports')}
          >
            取消
          </Button>
          <Button
            leftIcon={<Download className="h-4 w-4" />}
            onClick={handleGenerate}
            loading={generating}
          >
            生成报告
          </Button>
        </div>
      </div>
    </Layout>
  )
}

export default withAuth(GenerateReportPage, ['admin', 'engineer', 'manager'])