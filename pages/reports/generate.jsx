import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '@/components/layout/Layout'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
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
      toast.error('获取批次列表失败')
    }
  }

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
          <Button
            variant="outline"
            onClick={() => router.push('/reports')}
          >
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
      </div>
    </Layout>
  )
}
