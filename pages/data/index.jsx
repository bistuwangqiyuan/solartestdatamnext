import { useState, useEffect } from 'react'
import Layout from '@/components/layout/Layout'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Table from '@/components/ui/Table'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/router'
import toast from 'react-hot-toast'

export default function DataManagement() {
  const { user } = useAuth()
  const router = useRouter()
  const [batches, setBatches] = useState([])
  const [loading, setLoading] = useState(true)

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
      console.error('获取批次数据失败:', error)
      toast.error('获取数据失败')
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    {
      header: '批次名称',
      accessor: 'batch_name',
    },
    {
      header: '描述',
      accessor: 'description',
    },
    {
      header: '测试数量',
      accessor: 'test_count',
      cell: (value) => value || 0,
    },
    {
      header: '创建时间',
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
            onClick={() => router.push(`/data/batches/${value}`)}
          >
            查看详情
          </Button>
        </div>
      ),
    },
  ]

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">数据管理</h1>
          <Button onClick={() => router.push('/import')}>
            导入数据
          </Button>
        </div>

        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">测试批次列表</h2>
            {loading ? (
              <div className="text-center py-8">
                <div className="loading-spinner w-8 h-8 mx-auto"></div>
                <p className="mt-2 text-gray-500">加载中...</p>
              </div>
            ) : batches.length > 0 ? (
              <Table columns={columns} data={batches} />
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">暂无数据</p>
                <Button
                  className="mt-4"
                  onClick={() => router.push('/import')}
                >
                  立即导入
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>
    </Layout>
  )
}
