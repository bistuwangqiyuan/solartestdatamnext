import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '@/components/layout/Layout'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Table from '@/components/ui/Table'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

export default function Reports() {
  const { user } = useAuth()
  const router = useRouter()
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
      return
    }
    fetchReports()
  }, [user])

  const fetchReports = async () => {
    try {
      const { data, error } = await supabase
        .from('test_reports')
        .select('*, test_batches(batch_name)')
        .order('created_at', { ascending: false })

      if (error) throw error
      setReports(data || [])
    } catch (error) {
      console.error('获取报告列表失败:', error)
      toast.error('获取报告失败')
    } finally {
      setLoading(false)
    }
  }

  const downloadReport = async (report) => {
    try {
      // 这里应该从存储服务下载实际的报告文件
      // 示例：创建一个简单的文本报告
      const content = `
测试报告
=============================
报告名称: ${report.report_name}
批次: ${report.test_batches?.batch_name}
报告类型: ${report.report_type}
生成时间: ${new Date(report.created_at).toLocaleString()}
=============================

报告内容摘要:
${report.summary || '暂无摘要'}
      `

      const blob = new Blob([content], { type: 'text/plain' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${report.report_name}.txt`
      a.click()
      window.URL.revokeObjectURL(url)

      toast.success('下载成功')
    } catch (error) {
      console.error('下载失败:', error)
      toast.error('下载失败')
    }
  }

  const columns = [
    {
      header: '报告名称',
      accessor: 'report_name',
    },
    {
      header: '批次',
      accessor: 'test_batches',
      cell: (value) => value?.batch_name || '-',
    },
    {
      header: '报告类型',
      accessor: 'report_type',
      cell: (value) => {
        const typeMap = {
          'summary': '汇总报告',
          'detail': '详细报告',
          'quality': '质量分析报告'
        }
        return typeMap[value] || value
      },
    },
    {
      header: '生成时间',
      accessor: 'created_at',
      cell: (value) => new Date(value).toLocaleString(),
    },
    {
      header: '操作',
      accessor: 'id',
      cell: (value, row) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => downloadReport(row)}
          >
            下载
          </Button>
        </div>
      ),
    },
  ]

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">测试报告</h1>
          <Button onClick={() => router.push('/reports/generate')}>
            生成新报告
          </Button>
        </div>

        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">报告列表</h2>
            {loading ? (
              <div className="text-center py-8">
                <div className="loading-spinner w-8 h-8 mx-auto"></div>
                <p className="mt-2 text-gray-500">加载中...</p>
              </div>
            ) : reports.length > 0 ? (
              <Table columns={columns} data={reports} />
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">暂无报告</p>
                <Button
                  className="mt-4"
                  onClick={() => router.push('/reports/generate')}
                >
                  生成第一份报告
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>
    </Layout>
  )
}
