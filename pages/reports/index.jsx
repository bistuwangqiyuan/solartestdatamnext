<<<<<<< HEAD
import { useState, useEffect } from 'react'
=======
import React, { useState, useEffect } from 'react'
>>>>>>> 416d0a8e00024729bd2acdc2335c39882588cf35
import { useRouter } from 'next/router'
import Layout from '@/components/layout/Layout'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Table from '@/components/ui/Table'
<<<<<<< HEAD
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
=======
import Badge from '@/components/ui/Badge'
import { ConfirmModal } from '@/components/ui/Modal'
import { withAuth } from '@/components/auth/ProtectedRoute'
import { reportService as dbReportService } from '@/services/database'
import { formatDate, formatDateTime } from '@/utils/format'
import toast from 'react-hot-toast'
import { 
  FileText,
  Download,
  Eye,
  Trash2,
  Plus,
  Calendar,
  User,
  FileSpreadsheet
} from 'lucide-react'

const reportTypeMap = {
  daily: { text: '日报', color: 'primary' },
  weekly: { text: '周报', color: 'success' },
  monthly: { text: '月报', color: 'warning' },
  batch: { text: '批次报告', color: 'secondary' },
  custom: { text: '自定义', color: 'gray' }
}

function ReportsPage() {
  const router = useRouter()
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    reportId: null
  })

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    setLoading(true)
    try {
      const { data } = await dbReportService.getAllReports({
        page: 1,
        pageSize: 50
      })
      setReports(data)
    } catch (error) {
      toast.error('获取报告列表失败')
>>>>>>> 416d0a8e00024729bd2acdc2335c39882588cf35
    } finally {
      setLoading(false)
    }
  }

<<<<<<< HEAD
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
=======
  const handleDelete = async () => {
    try {
      await dbReportService.deleteReport(deleteModal.reportId)
      toast.success('删除成功')
      setDeleteModal({ open: false, reportId: null })
      fetchReports()
    } catch (error) {
      toast.error('删除失败')
    }
  }

  const handleDownload = (report) => {
    if (report.file_url) {
      window.open(report.file_url, '_blank')
    } else {
      toast.error('报告文件不存在')
>>>>>>> 416d0a8e00024729bd2acdc2335c39882588cf35
    }
  }

  const columns = [
    {
<<<<<<< HEAD
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
=======
      title: '报告名称',
      dataIndex: 'name',
      key: 'name',
      render: (value) => (
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-gray-400" />
          <span className="font-medium">{value}</span>
        </div>
      )
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (value) => {
        const type = reportTypeMap[value] || { text: value, color: 'gray' }
        return <Badge variant={type.color}>{type.text}</Badge>
      }
    },
    {
      title: '关联批次',
      dataIndex: 'batch',
      key: 'batch',
      render: (value) => value ? (
        <span className="text-primary-600 cursor-pointer hover:text-primary-700">
          {value.batch_number}
        </span>
      ) : '-'
    },
    {
      title: '生成人',
      dataIndex: 'generated_by',
      key: 'generated_by',
      render: (value) => (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-gray-400" />
          <span>{value?.name || '-'}</span>
        </div>
      )
    },
    {
      title: '生成时间',
      dataIndex: 'generated_at',
      key: 'generated_at',
      render: (value) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span>{formatDateTime(value)}</span>
        </div>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (value) => (
        <Badge variant={value === 'completed' ? 'success' : value === 'generating' ? 'warning' : 'danger'}>
          {value === 'completed' ? '已完成' : value === 'generating' ? '生成中' : '失败'}
        </Badge>
      )
    },
    {
      title: '操作',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <div className="flex items-center gap-2">
          {record.status === 'completed' && (
            <>
              <button
                onClick={() => handleDownload(record)}
                className="p-1 text-gray-600 hover:text-primary-600 transition-colors"
                title="下载"
              >
                <Download className="h-4 w-4" />
              </button>
              <button
                onClick={() => window.open(record.file_url, '_blank')}
                className="p-1 text-gray-600 hover:text-primary-600 transition-colors"
                title="查看"
              >
                <Eye className="h-4 w-4" />
              </button>
            </>
          )}
          <button
            onClick={() => setDeleteModal({ open: true, reportId: record.id })}
            className="p-1 text-gray-600 hover:text-danger-600 transition-colors"
            title="删除"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )
    }
>>>>>>> 416d0a8e00024729bd2acdc2335c39882588cf35
  ]

  return (
    <Layout>
      <div className="space-y-6">
<<<<<<< HEAD
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
=======
        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">报告中心</h1>
            <p className="text-gray-600 mt-1">查看和管理所有生成的报告</p>
          </div>
          <Button
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => router.push('/reports/generate')}
          >
            生成报告
          </Button>
        </div>

        {/* Report types summary */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {Object.entries(reportTypeMap).map(([key, value]) => {
            const count = reports.filter(r => r.type === key).length
            return (
              <Card key={key} className="text-center">
                <FileSpreadsheet className={`h-8 w-8 mx-auto mb-2 text-${value.color}-600`} />
                <p className="text-2xl font-bold">{count}</p>
                <p className="text-sm text-gray-600">{value.text}</p>
              </Card>
            )
          })}
        </div>

        {/* Reports table */}
        <Card noPadding>
          <Table
            columns={columns}
            data={reports}
            loading={loading}
            emptyMessage="暂无报告"
          />
        </Card>

        {/* Delete confirmation modal */}
        <ConfirmModal
          isOpen={deleteModal.open}
          onClose={() => setDeleteModal({ open: false, reportId: null })}
          onConfirm={handleDelete}
          title="确认删除"
          message="确定要删除这个报告吗？此操作不可恢复。"
          confirmText="删除"
          confirmVariant="danger"
        />
>>>>>>> 416d0a8e00024729bd2acdc2335c39882588cf35
      </div>
    </Layout>
  )
}
<<<<<<< HEAD
=======

export default withAuth(ReportsPage)
>>>>>>> 416d0a8e00024729bd2acdc2335c39882588cf35
