<<<<<<< HEAD
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
=======
import React, { useEffect, useState } from 'react'
import Layout from '@/components/layout/Layout'
import Card, { CardGrid } from '@/components/ui/Card'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { 
  Activity, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle,
  Database,
  FileSpreadsheet,
  BarChart,
  Users
} from 'lucide-react'
import CountUp from 'react-countup'
import { formatNumber, formatPercent } from '@/utils/format'
import { withAuth } from '@/components/auth/ProtectedRoute'

// Mock data - will be replaced with real API calls
const mockStats = {
  totalBatches: 156,
  totalTests: 3240,
  overallPassRate: 94.5,
  todayTests: 42,
  weeklyGrowth: 12.5,
  monthlyGrowth: 23.8,
  activeUsers: 18,
  pendingReports: 5
}

const StatCard = ({ title, value, icon: Icon, trend, color = 'primary' }) => {
  const colorClasses = {
    primary: 'bg-primary-100 text-primary-600',
    success: 'bg-success-100 text-success-600',
    warning: 'bg-warning-100 text-warning-600',
    danger: 'bg-danger-100 text-danger-600'
  }

  return (
    <Card className="relative overflow-hidden">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            <CountUp end={value} duration={1} separator="," decimals={value % 1 !== 0 ? 1 : 0} />
            {title.includes('率') && '%'}
          </p>
          {trend && (
            <p className={`text-sm mt-2 ${trend > 0 ? 'text-success-600' : 'text-danger-600'}`}>
              <TrendingUp className="h-4 w-4 inline mr-1" />
              {trend > 0 ? '+' : ''}{formatPercent(trend)}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
      
      {/* Background decoration */}
      <div className="absolute -right-4 -bottom-4 opacity-10">
        <Icon className="h-32 w-32" />
      </div>
    </Card>
  )
}

function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setStats(mockStats)
      setLoading(false)
    }, 1000)
  }, [])
>>>>>>> 416d0a8e00024729bd2acdc2335c39882588cf35

  return (
    <Layout>
      <div className="space-y-6">
<<<<<<< HEAD
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
=======
        {/* Page header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">仪表盘</h1>
          <p className="text-gray-600 mt-1">系统数据概览和关键指标监控</p>
        </div>

        {/* Stats grid */}
        <CardGrid columns={4}>
          {loading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : (
            <>
              <StatCard
                title="测试批次总数"
                value={stats.totalBatches}
                icon={Database}
                color="primary"
              />
              <StatCard
                title="测试用例总数"
                value={stats.totalTests}
                icon={FileSpreadsheet}
                color="success"
              />
              <StatCard
                title="整体合格率"
                value={stats.overallPassRate}
                icon={CheckCircle}
                trend={stats.weeklyGrowth}
                color="success"
              />
              <StatCard
                title="今日测试数"
                value={stats.todayTests}
                icon={Activity}
                trend={stats.monthlyGrowth}
                color="warning"
              />
            </>
          )}
        </CardGrid>

        {/* Charts section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="测试趋势" subtitle="过去30天的测试数量变化">
            <div className="h-64 flex items-center justify-center text-gray-400">
              <BarChart className="h-12 w-12" />
              <span className="ml-2">图表组件待实现</span>
            </div>
          </Card>

          <Card title="设备类型分布" subtitle="各设备型号的测试占比">
            <div className="h-64 flex items-center justify-center text-gray-400">
              <BarChart className="h-12 w-12" />
              <span className="ml-2">图表组件待实现</span>
>>>>>>> 416d0a8e00024729bd2acdc2335c39882588cf35
            </div>
          </Card>
        </div>

<<<<<<< HEAD
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
=======
        {/* Recent activities */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card title="最近测试批次" subtitle="最新的测试批次记录">
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">批次 #2025{String(i).padStart(4, '0')}</p>
                      <p className="text-sm text-gray-600">设备型号: PV-SD-{i}00</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">2025-09-{String(13 - i).padStart(2, '0')}</p>
                      <p className="text-sm font-medium text-success-600">合格率: {90 + i}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div>
            <Card title="系统状态" subtitle="各项服务运行状态">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-success-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-success-600" />
                    <span className="text-sm font-medium">数据库服务</span>
                  </div>
                  <span className="text-xs text-success-600">正常</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-success-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-success-600" />
                    <span className="text-sm font-medium">文件存储</span>
                  </div>
                  <span className="text-xs text-success-600">正常</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-warning-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-warning-600" />
                    <span className="text-sm font-medium">报告生成</span>
                  </div>
                  <span className="text-xs text-warning-600">队列: 5</span>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-600">在线用户</span>
                  <span className="text-sm font-medium">{stats?.activeUsers || 0}</span>
                </div>
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-medium ring-2 ring-white"
                    >
                      U{i}
                    </div>
                  ))}
                  {stats?.activeUsers > 5 && (
                    <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-xs font-medium ring-2 ring-white">
                      +{stats.activeUsers - 5}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>
>>>>>>> 416d0a8e00024729bd2acdc2335c39882588cf35
      </div>
    </Layout>
  )
}
<<<<<<< HEAD
=======

export default withAuth(DashboardPage)
>>>>>>> 416d0a8e00024729bd2acdc2335c39882588cf35
