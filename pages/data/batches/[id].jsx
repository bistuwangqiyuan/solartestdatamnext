<<<<<<< HEAD
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
=======
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
>>>>>>> 416d0a8e00024729bd2acdc2335c39882588cf35
import Layout from '@/components/layout/Layout'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Table from '@/components/ui/Table'
<<<<<<< HEAD
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

export default function BatchDetail() {
  const { user } = useAuth()
=======
import Badge from '@/components/ui/Badge'
import { Skeleton, SkeletonText } from '@/components/ui/Skeleton'
import { withAuth } from '@/components/auth/ProtectedRoute'
import { batchService, testDataService } from '@/services/database'
import { exportToExcel } from '@/utils/excel'
import { formatDate, formatDateTime, formatPercent, formatTestResult } from '@/utils/format'
import toast from 'react-hot-toast'
import { 
  ArrowLeft,
  Download, 
  Edit, 
  FileText,
  Calendar,
  User,
  Package,
  Factory,
  BarChart,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'

function BatchDetailPage() {
>>>>>>> 416d0a8e00024729bd2acdc2335c39882588cf35
  const router = useRouter()
  const { id } = router.query
  const [batch, setBatch] = useState(null)
  const [testData, setTestData] = useState([])
  const [loading, setLoading] = useState(true)
<<<<<<< HEAD

  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
      return
    }
    if (id) {
      fetchBatchDetails()
    }
  }, [user, id])

  const fetchBatchDetails = async () => {
    try {
      // 获取批次信息
      const { data: batchData, error: batchError } = await supabase
        .from('test_batches')
        .select('*')
        .eq('id', id)
        .single()

      if (batchError) throw batchError
      setBatch(batchData)

      // 获取该批次的测试数据
      const { data: tests, error: testError } = await supabase
        .from('test_data')
        .select('*')
        .eq('batch_id', id)
        .order('test_time', { ascending: false })

      if (testError) throw testError
      setTestData(tests || [])
    } catch (error) {
      console.error('获取批次详情失败:', error)
      toast.error('获取数据失败')
=======
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    if (id) {
      fetchBatchDetails()
    }
  }, [id])

  const fetchBatchDetails = async () => {
    setLoading(true)
    try {
      const [batchData, tests] = await Promise.all([
        batchService.getBatch(id),
        testDataService.getTestDataByBatch(id)
      ])
      
      setBatch(batchData)
      setTestData(tests)
    } catch (error) {
      toast.error('获取批次详情失败')
      router.push('/data')
>>>>>>> 416d0a8e00024729bd2acdc2335c39882588cf35
    } finally {
      setLoading(false)
    }
  }

<<<<<<< HEAD
  const exportData = async () => {
    try {
      const { data, error } = await supabase
        .from('test_data')
        .select('*')
        .eq('batch_id', id)
        .csv()

      if (error) throw error

      // 创建并下载CSV文件
      const blob = new Blob([data], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${batch.batch_name}_测试数据.csv`
      a.click()
      window.URL.revokeObjectURL(url)
      
      toast.success('导出成功')
    } catch (error) {
      console.error('导出失败:', error)
      toast.error('导出失败')
=======
  const handleExport = async () => {
    setExporting(true)
    try {
      const exportData = testData.map(test => ({
        '测试项目': test.test_item,
        '测试值': test.test_value,
        '单位': test.unit,
        '标准值': test.standard_value || '-',
        '偏差': test.deviation || '-',
        '结果': formatTestResult(test.result).text,
        '温度': test.test_conditions?.temperature || '-',
        '湿度': test.test_conditions?.humidity || '-',
        '测试时间': formatDateTime(test.created_at)
      }))
      
      const success = exportToExcel(exportData, `batch_${batch.batch_number}`)
      if (success) {
        toast.success('导出成功')
      } else {
        toast.error('导出失败')
      }
    } catch (error) {
      toast.error('导出失败')
    } finally {
      setExporting(false)
>>>>>>> 416d0a8e00024729bd2acdc2335c39882588cf35
    }
  }

  const columns = [
    {
<<<<<<< HEAD
      header: '产品序列号',
      accessor: 'product_serial',
    },
    {
      header: '测试电压(V)',
      accessor: 'test_voltage',
    },
    {
      header: '测试电流(A)',
      accessor: 'test_current',
    },
    {
      header: '内阻(Ω)',
      accessor: 'internal_resistance',
    },
    {
      header: '温度(°C)',
      accessor: 'temperature',
    },
    {
      header: '测试结果',
      accessor: 'test_result',
      cell: (value) => (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
          value === 'PASS' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {value}
=======
      title: '测试项目',
      dataIndex: 'test_item',
      key: 'test_item',
    },
    {
      title: '测试值',
      dataIndex: 'test_value',
      key: 'test_value',
      render: (value, record) => (
        <span className="font-mono">
          {value} {record.unit}
>>>>>>> 416d0a8e00024729bd2acdc2335c39882588cf35
        </span>
      ),
    },
    {
<<<<<<< HEAD
      header: '测试时间',
      accessor: 'test_time',
      cell: (value) => new Date(value).toLocaleString(),
=======
      title: '标准值',
      dataIndex: 'standard_value',
      key: 'standard_value',
      render: (value, record) => (
        <span className="font-mono text-gray-600">
          {value || '-'} {value && record.unit}
        </span>
      ),
    },
    {
      title: '偏差',
      dataIndex: 'deviation',
      key: 'deviation',
      render: (value) => {
        if (!value) return '-'
        const absValue = Math.abs(value)
        return (
          <span className={absValue > 5 ? 'text-danger-600' : absValue > 2 ? 'text-warning-600' : 'text-success-600'}>
            {value > 0 ? '+' : ''}{value.toFixed(2)}%
          </span>
        )
      },
    },
    {
      title: '结果',
      dataIndex: 'result',
      key: 'result',
      render: (value) => {
        const result = formatTestResult(value)
        return (
          <Badge 
            variant={
              value === 'pass' ? 'success' : 
              value === 'fail' ? 'danger' : 
              value === 'warning' ? 'warning' : 'gray'
            }
          >
            {result.text}
          </Badge>
        )
      },
    },
    {
      title: '测试条件',
      key: 'conditions',
      render: (_, record) => {
        const conditions = record.test_conditions || {}
        return (
          <div className="text-sm text-gray-600">
            {conditions.temperature && <div>温度: {conditions.temperature}°C</div>}
            {conditions.humidity && <div>湿度: {conditions.humidity}%</div>}
          </div>
        )
      },
    },
    {
      title: '测试时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (value) => formatDateTime(value),
>>>>>>> 416d0a8e00024729bd2acdc2335c39882588cf35
    },
  ]

  if (loading) {
    return (
      <Layout>
<<<<<<< HEAD
        <div className="flex justify-center items-center h-64">
          <div className="loading-spinner w-8 h-8"></div>
=======
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <Card>
            <SkeletonText lines={5} />
          </Card>
          <Card>
            <Skeleton className="h-64" />
          </Card>
>>>>>>> 416d0a8e00024729bd2acdc2335c39882588cf35
        </div>
      </Layout>
    )
  }

<<<<<<< HEAD
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <Button
              variant="ghost"
              onClick={() => router.push('/data')}
              className="mb-2"
            >
              ← 返回列表
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">
              批次详情: {batch?.batch_name}
            </h1>
            <p className="text-gray-500 mt-1">{batch?.description}</p>
          </div>
          <Button onClick={exportData}>
            导出数据
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-500">测试总数</h3>
              <p className="mt-1 text-2xl font-semibold text-gray-900">
                {testData.length}
              </p>
            </div>
          </Card>
          <Card>
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-500">合格数量</h3>
              <p className="mt-1 text-2xl font-semibold text-green-600">
                {testData.filter(t => t.test_result === 'PASS').length}
              </p>
            </div>
          </Card>
          <Card>
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-500">不合格数量</h3>
              <p className="mt-1 text-2xl font-semibold text-red-600">
                {testData.filter(t => t.test_result === 'FAIL').length}
              </p>
            </div>
          </Card>
          <Card>
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-500">合格率</h3>
              <p className="mt-1 text-2xl font-semibold text-gray-900">
                {testData.length > 0 
                  ? ((testData.filter(t => t.test_result === 'PASS').length / testData.length) * 100).toFixed(2)
                  : 0}%
              </p>
            </div>
          </Card>
        </div>

        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">测试数据列表</h2>
            {testData.length > 0 ? (
              <Table columns={columns} data={testData} />
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">该批次暂无测试数据</p>
              </div>
            )}
          </div>
=======
  if (!batch) {
    return null
  }

  // Calculate statistics
  const totalTests = testData.length
  const passedTests = testData.filter(t => t.result === 'pass').length
  const failedTests = testData.filter(t => t.result === 'fail').length
  const warningTests = testData.filter(t => t.result === 'warning').length

  return (
    <Layout>
      <div className="space-y-6">
        {/* Page header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/data">
              <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />}>
                返回
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">批次详情</h1>
              <p className="text-gray-600 mt-1">批次号: {batch.batch_number}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              leftIcon={<FileText className="h-4 w-4" />}
              onClick={() => router.push(`/reports/generate?batchId=${id}`)}
            >
              生成报告
            </Button>
            <Button
              variant="outline"
              leftIcon={<Download className="h-4 w-4" />}
              onClick={handleExport}
              loading={exporting}
            >
              导出数据
            </Button>
            <Button
              leftIcon={<Edit className="h-4 w-4" />}
              onClick={() => router.push(`/data/batches/${id}/edit`)}
            >
              编辑
            </Button>
          </div>
        </div>

        {/* Batch info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card title="基本信息">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Package className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">设备型号</p>
                      <p className="font-medium">{batch.device_model}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Factory className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">制造商</p>
                      <p className="font-medium">{batch.manufacturer || '-'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">生产日期</p>
                      <p className="font-medium">{batch.production_date ? formatDate(batch.production_date) : '-'}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">测试日期</p>
                      <p className="font-medium">{formatDate(batch.test_date)}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">操作员</p>
                      <p className="font-medium">{batch.operator?.name || '-'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <BarChart className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">状态</p>
                      <Badge variant={batch.status === 'completed' ? 'success' : 'primary'}>
                        {batch.status === 'completed' ? '已完成' : '进行中'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div>
            <Card title="测试统计">
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary-600">{formatPercent(batch.pass_rate)}</p>
                  <p className="text-sm text-gray-600 mt-1">总体合格率</p>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <p className="text-xl font-semibold text-gray-900">{totalTests}</p>
                    <p className="text-sm text-gray-600">测试总数</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-semibold text-success-600">{passedTests}</p>
                    <p className="text-sm text-gray-600">合格数</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-success-50 rounded">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success-600" />
                      <span className="text-sm">合格</span>
                    </div>
                    <span className="text-sm font-medium">{passedTests}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-danger-50 rounded">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-danger-600" />
                      <span className="text-sm">不合格</span>
                    </div>
                    <span className="text-sm font-medium">{failedTests}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-warning-50 rounded">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-warning-600" />
                      <span className="text-sm">警告</span>
                    </div>
                    <span className="text-sm font-medium">{warningTests}</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Test data table */}
        <Card title="测试数据" subtitle={`共 ${totalTests} 条测试记录`} noPadding>
          <Table
            columns={columns}
            data={testData}
            emptyMessage="暂无测试数据"
          />
>>>>>>> 416d0a8e00024729bd2acdc2335c39882588cf35
        </Card>
      </div>
    </Layout>
  )
<<<<<<< HEAD
}
=======
}

export default withAuth(BatchDetailPage)
>>>>>>> 416d0a8e00024729bd2acdc2335c39882588cf35
