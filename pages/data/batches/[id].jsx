import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '@/components/layout/Layout'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Table from '@/components/ui/Table'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

export default function BatchDetail() {
  const { user } = useAuth()
  const router = useRouter()
  const { id } = router.query
  const [batch, setBatch] = useState(null)
  const [testData, setTestData] = useState([])
  const [loading, setLoading] = useState(true)

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
    } finally {
      setLoading(false)
    }
  }

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
    }
  }

  const columns = [
    {
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
        </span>
      ),
    },
    {
      header: '测试时间',
      accessor: 'test_time',
      cell: (value) => new Date(value).toLocaleString(),
    },
  ]

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="loading-spinner w-8 h-8"></div>
        </div>
      </Layout>
    )
  }

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
        </Card>
      </div>
    </Layout>
  )
}