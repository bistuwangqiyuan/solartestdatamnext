import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '@/components/layout/Layout'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Table, { TablePagination } from '@/components/ui/Table'
import Badge from '@/components/ui/Badge'
import { ConfirmModal } from '@/components/ui/Modal'
import { withAuth } from '@/components/auth/ProtectedRoute'
import { batchService } from '@/services/database'
import { formatDate, formatPercent, formatBatchStatus } from '@/utils/format'
import { useDebounce } from '@/hooks/useDebounce'
import toast from 'react-hot-toast'
import { 
  Search, 
  Filter, 
  Download, 
  Plus, 
  Eye, 
  Edit, 
  Trash2,
  FileSpreadsheet,
  Calendar
} from 'lucide-react'

const statusOptions = [
  { value: '', label: '全部状态' },
  { value: 'pending', label: '待测试' },
  { value: 'in_progress', label: '测试中' },
  { value: 'completed', label: '已完成' },
  { value: 'failed', label: '失败' },
]

function DataManagementPage() {
  const router = useRouter()
  const [batches, setBatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    total: 0,
  })
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    dateRange: {
      start: '',
      end: '',
    },
  })
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    batchId: null,
  })

  const debouncedSearch = useDebounce(filters.search, 500)

  useEffect(() => {
    fetchBatches()
  }, [pagination.page, pagination.pageSize, debouncedSearch, filters.status, filters.dateRange])

  const fetchBatches = async () => {
    setLoading(true)
    try {
      const { data, count } = await batchService.getAllBatches({
        page: pagination.page,
        pageSize: pagination.pageSize,
        filters: {
          status: filters.status || undefined,
        },
        dateRange: filters.dateRange,
      })
      
      setBatches(data)
      setPagination(prev => ({ ...prev, total: count }))
    } catch (error) {
      toast.error('获取数据失败')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    try {
      await batchService.deleteBatch(deleteModal.batchId)
      toast.success('删除成功')
      setDeleteModal({ open: false, batchId: null })
      fetchBatches()
    } catch (error) {
      toast.error('删除失败')
    }
  }

  const handleExport = () => {
    // TODO: Implement export functionality
    toast.info('导出功能开发中')
  }

  const columns = [
    {
      title: '批次号',
      dataIndex: 'batch_number',
      key: 'batch_number',
      render: (value) => (
        <span className="font-medium text-gray-900">{value}</span>
      ),
    },
    {
      title: '设备型号',
      dataIndex: 'device_model',
      key: 'device_model',
    },
    {
      title: '制造商',
      dataIndex: 'manufacturer',
      key: 'manufacturer',
      render: (value) => value || '-',
    },
    {
      title: '测试日期',
      dataIndex: 'test_date',
      key: 'test_date',
      render: (value) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          {formatDate(value)}
        </div>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (value) => {
        const status = formatBatchStatus(value)
        return <Badge variant={
          value === 'completed' ? 'success' : 
          value === 'failed' ? 'danger' : 
          value === 'in_progress' ? 'primary' : 'gray'
        }>{status.text}</Badge>
      },
    },
    {
      title: '合格率',
      dataIndex: 'pass_rate',
      key: 'pass_rate',
      render: (value) => (
        <span className={value >= 90 ? 'text-success-600' : value >= 70 ? 'text-warning-600' : 'text-danger-600'}>
          {formatPercent(value)}
        </span>
      ),
    },
    {
      title: '操作员',
      dataIndex: 'operator',
      key: 'operator',
      render: (value) => value?.name || '-',
    },
    {
      title: '操作',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push(`/data/batches/${record.id}`)}
            className="p-1 text-gray-600 hover:text-primary-600 transition-colors"
            title="查看详情"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => router.push(`/data/batches/${record.id}/edit`)}
            className="p-1 text-gray-600 hover:text-primary-600 transition-colors"
            title="编辑"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => setDeleteModal({ open: true, batchId: record.id })}
            className="p-1 text-gray-600 hover:text-danger-600 transition-colors"
            title="删除"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <Layout>
      <div className="space-y-6">
        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">数据管理</h1>
            <p className="text-gray-600 mt-1">管理所有测试批次和数据</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              leftIcon={<Download className="h-4 w-4" />}
              onClick={handleExport}
            >
              导出数据
            </Button>
            <Button
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={() => router.push('/import')}
            >
              导入数据
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="搜索批次号、设备型号..."
              leftIcon={<Search className="h-5 w-5" />}
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            />
            
            <Select
              options={statusOptions}
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            />
            
            <Input
              type="date"
              placeholder="开始日期"
              value={filters.dateRange.start}
              onChange={(e) => setFilters(prev => ({ 
                ...prev, 
                dateRange: { ...prev.dateRange, start: e.target.value }
              }))}
            />
            
            <Input
              type="date"
              placeholder="结束日期"
              value={filters.dateRange.end}
              onChange={(e) => setFilters(prev => ({ 
                ...prev, 
                dateRange: { ...prev.dateRange, end: e.target.value }
              }))}
            />
          </div>
        </Card>

        {/* Data table */}
        <Card noPadding>
          <Table
            columns={columns}
            data={batches}
            loading={loading}
            emptyMessage="暂无测试批次数据"
          />
          <TablePagination
            current={pagination.page}
            pageSize={pagination.pageSize}
            total={pagination.total}
            onChange={(page, pageSize) => {
              setPagination(prev => ({ ...prev, page, pageSize }))
            }}
          />
        </Card>

        {/* Delete confirmation modal */}
        <ConfirmModal
          isOpen={deleteModal.open}
          onClose={() => setDeleteModal({ open: false, batchId: null })}
          onConfirm={handleDelete}
          title="确认删除"
          message="确定要删除这个测试批次吗？此操作将同时删除所有相关的测试数据，且不可恢复。"
          confirmText="删除"
          confirmVariant="danger"
        />
      </div>
    </Layout>
  )
}

export default withAuth(DataManagementPage)