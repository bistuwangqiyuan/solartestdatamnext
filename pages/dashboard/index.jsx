import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Layout from '@/components/layout/Layout'
import Card from '@/components/ui/Card'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

export default function Dashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState({
    totalBatches: 0,
    totalTests: 0,
    passRate: 0,
    recentTests: []
  })

  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
      return
    }
    fetchDashboardData()
  }, [user])

  const fetchDashboardData = async () => {
    try {
      // 获取批次总数
      const { count: batchCount } = await supabase
        .from('test_batches')
        .select('*', { count: 'exact', head: true })

      // 获取测试总数
      const { count: testCount } = await supabase
        .from('test_data')
        .select('*', { count: 'exact', head: true })

      // 获取最近的测试数据
      const { data: recentTests } = await supabase
        .from('test_data')
        .select('*, test_batches(batch_name)')
        .order('created_at', { ascending: false })
        .limit(5)

      setStats({
        totalBatches: batchCount || 0,
        totalTests: testCount || 0,
        passRate: 95.5, // 示例数据
        recentTests: recentTests || []
      })
    } catch (error) {
      console.error('获取数据失败:', error)
      toast.error('获取数据失败')
    }
  }

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">仪表盘</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <div className="p-6">
              <h3 className="text-sm font-medium text-gray-500">测试批次</h3>
              <p className="mt-2 text-3xl font-semibold text-gray-900">{stats.totalBatches}</p>
            </div>
          </Card>
          
          <Card>
            <div className="p-6">
              <h3 className="text-sm font-medium text-gray-500">测试总数</h3>
              <p className="mt-2 text-3xl font-semibold text-gray-900">{stats.totalTests}</p>
            </div>
          </Card>
          
          <Card>
            <div className="p-6">
              <h3 className="text-sm font-medium text-gray-500">合格率</h3>
              <p className="mt-2 text-3xl font-semibold text-green-600">{stats.passRate}%</p>
            </div>
          </Card>
          
          <Card>
            <div className="p-6">
              <h3 className="text-sm font-medium text-gray-500">本月测试</h3>
              <p className="mt-2 text-3xl font-semibold text-gray-900">128</p>
            </div>
          </Card>
        </div>

        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">最近测试记录</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      产品序列号
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      批次
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      测试结果
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      测试时间
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stats.recentTests.map((test) => (
                    <tr key={test.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {test.product_serial}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {test.test_batches?.batch_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          test.test_result === 'PASS' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {test.test_result}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(test.test_time).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  )
}
