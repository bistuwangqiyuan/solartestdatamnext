<<<<<<< HEAD
import { useState, useEffect } from 'react'
=======
import React, { useState, useEffect } from 'react'
>>>>>>> 416d0a8e00024729bd2acdc2335c39882588cf35
import { useRouter } from 'next/router'
import Layout from '@/components/layout/Layout'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
<<<<<<< HEAD
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import jsPDF from 'jspdf'

export default function GenerateReport() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [batches, setBatches] = useState([])
  const [formData, setFormData] = useState({
    reportName: '',
    reportType: 'summary',
    batchId: '',
    includeCharts: true,
    includeDetails: false
  })

  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
      return
    }
    fetchBatches()
  }, [user])

  const fetchBatches = async () => {
    try {
      const { data, error } = await supabase
        .from('test_batches')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setBatches(data || [])
    } catch (error) {
      console.error('获取批次列表失败:', error)
=======
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
>>>>>>> 416d0a8e00024729bd2acdc2335c39882588cf35
      toast.error('获取批次列表失败')
    }
  }

<<<<<<< HEAD
  const generateReport = async () => {
    if (!formData.reportName || !formData.batchId) {
      toast.error('请填写所有必填字段')
      return
    }

    setLoading(true)

    try {
      // 获取批次数据
      const { data: batchData, error: batchError } = await supabase
        .from('test_batches')
        .select('*')
        .eq('id', formData.batchId)
        .single()

      if (batchError) throw batchError

      // 获取测试数据
      const { data: testData, error: testError } = await supabase
        .from('test_data')
        .select('*')
        .eq('batch_id', formData.batchId)

      if (testError) throw testError

      // 计算统计数据
      const totalTests = testData.length
      const passedTests = testData.filter(t => t.test_result === 'PASS').length
      const failedTests = totalTests - passedTests
      const passRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0

      // 生成PDF报告
      const doc = new jsPDF()
      
      // 标题
      doc.setFontSize(20)
      doc.text('Solar Shutdown Device Test Report', 20, 20)
      
      // 报告信息
      doc.setFontSize(12)
      doc.text(`Report Name: ${formData.reportName}`, 20, 40)
      doc.text(`Batch: ${batchData.batch_name}`, 20, 50)
      doc.text(`Report Type: ${formData.reportType}`, 20, 60)
      doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 70)
      
      // 统计摘要
      doc.setFontSize(14)
      doc.text('Test Summary', 20, 90)
      doc.setFontSize(12)
      doc.text(`Total Tests: ${totalTests}`, 20, 100)
      doc.text(`Passed: ${passedTests}`, 20, 110)
      doc.text(`Failed: ${failedTests}`, 20, 120)
      doc.text(`Pass Rate: ${passRate.toFixed(2)}%`, 20, 130)

      // 如果需要包含详细数据
      if (formData.includeDetails && testData.length > 0) {
        doc.addPage()
        doc.setFontSize(14)
        doc.text('Test Details', 20, 20)
        
        // 添加测试数据表格（简化版）
        let y = 40
        doc.setFontSize(10)
        testData.slice(0, 20).forEach((test, index) => {
          doc.text(
            `${index + 1}. ${test.product_serial} - ${test.test_result} - ${new Date(test.test_time).toLocaleDateString()}`,
            20,
            y
          )
          y += 10
          if (y > 270) {
            doc.addPage()
            y = 20
          }
        })
      }

      // 保存PDF
      const pdfBlob = doc.output('blob')
      const pdfUrl = window.URL.createObjectURL(pdfBlob)
      const a = document.createElement('a')
      a.href = pdfUrl
      a.download = `${formData.reportName}.pdf`
      a.click()
      window.URL.revokeObjectURL(pdfUrl)

      // 保存报告记录到数据库
      const { error: saveError } = await supabase
        .from('test_reports')
        .insert({
          report_name: formData.reportName,
          report_type: formData.reportType,
          batch_id: formData.batchId,
          summary: `Total: ${totalTests}, Passed: ${passedTests}, Failed: ${failedTests}, Pass Rate: ${passRate.toFixed(2)}%`,
          created_by: user.id
        })

      if (saveError) throw saveError

      toast.success('报告生成成功')
      router.push('/reports')
    } catch (error) {
      console.error('生成报告失败:', error)
      toast.error('生成报告失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">生成测试报告</h1>
=======
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
>>>>>>> 416d0a8e00024729bd2acdc2335c39882588cf35
          <Button
            variant="outline"
            onClick={() => router.push('/reports')}
          >
<<<<<<< HEAD
            返回报告列表
          </Button>
        </div>

        <Card>
          <div className="p-6">
            <form onSubmit={(e) => { e.preventDefault(); generateReport(); }} className="space-y-6">
              <Input
                label="报告名称"
                value={formData.reportName}
                onChange={(e) => setFormData({ ...formData, reportName: e.target.value })}
                placeholder="输入报告名称"
                required
              />

              <Select
                label="报告类型"
                value={formData.reportType}
                onChange={(e) => setFormData({ ...formData, reportType: e.target.value })}
                options={[
                  { value: 'summary', label: '汇总报告' },
                  { value: 'detail', label: '详细报告' },
                  { value: 'quality', label: '质量分析报告' }
                ]}
              />

              <Select
                label="选择批次"
                value={formData.batchId}
                onChange={(e) => setFormData({ ...formData, batchId: e.target.value })}
                options={[
                  { value: '', label: '请选择批次' },
                  ...batches.map(batch => ({
                    value: batch.id,
                    label: batch.batch_name
                  }))
                ]}
                required
              />

              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.includeCharts}
                    onChange={(e) => setFormData({ ...formData, includeCharts: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">包含图表</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.includeDetails}
                    onChange={(e) => setFormData({ ...formData, includeDetails: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">包含详细数据</span>
                </label>
              </div>

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/reports')}
                >
                  取消
                </Button>
                <Button
                  type="submit"
                  loading={loading}
                  disabled={loading}
                >
                  生成报告
                </Button>
              </div>
            </form>
          </div>
        </Card>
=======
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
>>>>>>> 416d0a8e00024729bd2acdc2335c39882588cf35
      </div>
    </Layout>
  )
}
<<<<<<< HEAD
=======

export default withAuth(GenerateReportPage, ['admin', 'engineer', 'manager'])
>>>>>>> 416d0a8e00024729bd2acdc2335c39882588cf35
