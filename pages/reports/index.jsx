import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '@/components/layout/Layout'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Table from '@/components/ui/Table'
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
    } finally {
      setLoading(false)
    }
  }

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
    }
  }

  const columns = [
    {
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
  ]

  return (
    <Layout>
      <div className="space-y-6">
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
      </div>
    </Layout>
  )
}

export default withAuth(ReportsPage)