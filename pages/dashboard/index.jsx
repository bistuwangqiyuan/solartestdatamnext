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

  return (
    <Layout>
      <div className="space-y-6">
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
            </div>
          </Card>
        </div>

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
      </div>
    </Layout>
  )
}

export default withAuth(DashboardPage)