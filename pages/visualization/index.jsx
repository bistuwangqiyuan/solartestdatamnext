<<<<<<< HEAD
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '@/components/layout/Layout'
import Card from '@/components/ui/Card'
=======
import React, { useState, useEffect } from 'react'
import { withAuth } from '@/components/auth/ProtectedRoute'
import Card from '@/components/ui/Card'
import { SkeletonCard } from '@/components/ui/Skeleton'
>>>>>>> 416d0a8e00024729bd2acdc2335c39882588cf35
import LineChart from '@/components/charts/LineChart'
import BarChart from '@/components/charts/BarChart'
import PieChart from '@/components/charts/PieChart'
import GaugeChart from '@/components/charts/GaugeChart'
<<<<<<< HEAD
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

export default function Visualization() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState({
    dailyStats: [],
    batchStats: [],
    passRateByBatch: [],
    currentPassRate: 0,
    totalTests: 0,
    passedTests: 0,
    failedTests: 0
  })

  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
      return
    }
    fetchVisualizationData()
  }, [user])

  const fetchVisualizationData = async () => {
    try {
      // 获取所有测试数据
      const { data: testData, error } = await supabase
        .from('test_data')
        .select('*, test_batches(batch_name)')
        .order('test_time', { ascending: false })

      if (error) throw error

      // 计算统计数据
      const totalTests = testData.length
      const passedTests = testData.filter(t => t.test_result === 'PASS').length
      const failedTests = totalTests - passedTests
      const currentPassRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0

      // 按日期统计
      const dailyStats = {}
      testData.forEach(test => {
        const date = new Date(test.test_time).toLocaleDateString()
        if (!dailyStats[date]) {
          dailyStats[date] = { date, total: 0, passed: 0, failed: 0 }
        }
        dailyStats[date].total++
        if (test.test_result === 'PASS') {
          dailyStats[date].passed++
        } else {
          dailyStats[date].failed++
        }
      })

      // 按批次统计
      const batchStats = {}
      testData.forEach(test => {
        const batchName = test.test_batches?.batch_name || '未知批次'
        if (!batchStats[batchName]) {
          batchStats[batchName] = { name: batchName, total: 0, passed: 0, failed: 0 }
        }
        batchStats[batchName].total++
        if (test.test_result === 'PASS') {
          batchStats[batchName].passed++
        } else {
          batchStats[batchName].failed++
        }
      })

      // 批次合格率
      const passRateByBatch = Object.values(batchStats).map(batch => ({
        name: batch.name,
        passRate: batch.total > 0 ? (batch.passed / batch.total) * 100 : 0
      }))

      setData({
        dailyStats: Object.values(dailyStats).slice(-7), // 最近7天
        batchStats: Object.values(batchStats).slice(0, 5), // 前5个批次
        passRateByBatch: passRateByBatch.slice(0, 5),
        currentPassRate,
        totalTests,
        passedTests,
        failedTests
      })
    } catch (error) {
      console.error('获取数据失败:', error)
      toast.error('获取数据失败')
    } finally {
=======
import { formatNumber, formatPercent, formatDate } from '@/utils/format'
import { useMultipleRealtimeSubscriptions } from '@/hooks/useRealtimeSubscription'
import { analyticsService } from '@/services/database'
import { 
  Activity, 
  TrendingUp, 
  Package,
  CheckCircle,
  AlertTriangle,
  Zap,
  Thermometer,
  Droplets
} from 'lucide-react'
import CountUp from 'react-countup'

// Mock data - will be replaced with real API calls
const mockDashboardData = {
  // Real-time metrics
  currentMetrics: {
    temperature: 25.3,
    humidity: 65.2,
    activeTests: 3,
    todayTotal: 42,
    todayPass: 38,
    todayFail: 4,
    overallPassRate: 94.5
  },
  
  // Trend data for line chart
  trendData: {
    labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
    datasets: [
      {
        label: '合格率',
        data: [92.3, 93.1, 94.2, 93.8, 94.5, 94.5],
        borderColor: '#00D084',
        tension: 0.4
      },
      {
        label: '测试数量',
        data: [320, 380, 410, 390, 420, 450],
        borderColor: '#0066FF',
        tension: 0.4,
        yAxisID: 'y1'
      }
    ]
  },
  
  // Device distribution for pie chart
  deviceDistribution: {
    labels: ['PV-SD-100', 'PV-SD-200', 'PV-SD-300', 'PV-SD-400', 'PV-SD-500'],
    datasets: [{
      data: [125, 98, 87, 156, 78]
    }]
  },
  
  // Daily test results for bar chart
  dailyResults: {
    labels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
    datasets: [
      {
        label: '合格',
        data: [65, 72, 68, 75, 82, 45, 38],
        backgroundColor: '#00D084'
      },
      {
        label: '不合格',
        data: [5, 3, 7, 4, 6, 2, 3],
        backgroundColor: '#FF3B30'
      }
    ]
  },
  
  // Recent alerts
  recentAlerts: [
    { id: 1, type: 'warning', message: '批次 #20250001 合格率低于90%', time: '10分钟前' },
    { id: 2, type: 'error', message: '设备 PV-SD-300 连续3次测试失败', time: '25分钟前' },
    { id: 3, type: 'info', message: '今日测试目标已完成80%', time: '1小时前' }
  ],
  
  // Top performers
  topPerformers: [
    { name: '张工程师', tests: 156, passRate: 97.8 },
    { name: '李工程师', tests: 142, passRate: 96.5 },
    { name: '王工程师', tests: 138, passRate: 95.2 }
  ]
}

function VisualizationPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())

  // Set up realtime subscriptions
  useMultipleRealtimeSubscriptions([
    {
      table: 'test_batches',
      onUpdate: (payload) => {
        console.log('Test batch update:', payload)
        // Refresh dashboard data when test batches change
        fetchDashboardData()
      }
    },
    {
      table: 'test_data',
      onUpdate: (payload) => {
        console.log('Test data update:', payload)
        // Update specific metrics
        if (payload.eventType === 'INSERT') {
          setData(prev => ({
            ...prev,
            currentMetrics: {
              ...prev.currentMetrics,
              todayTotal: prev.currentMetrics.todayTotal + 1,
              todayPass: payload.new.result === 'pass' 
                ? prev.currentMetrics.todayPass + 1 
                : prev.currentMetrics.todayPass
            }
          }))
        }
      }
    },
    {
      table: 'alerts',
      onUpdate: (payload) => {
        if (payload.eventType === 'INSERT') {
          // Add new alert to the list
          setData(prev => ({
            ...prev,
            recentAlerts: [
              {
                id: payload.new.id,
                type: payload.new.type,
                message: payload.new.message,
                time: '刚刚'
              },
              ...prev.recentAlerts.slice(0, 2)
            ]
          }))
        }
      }
    }
  ])

  useEffect(() => {
    fetchDashboardData()

    // Update time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    // Refresh data every 30 seconds
    const refreshTimer = setInterval(() => {
      fetchDashboardData()
    }, 30000)

    return () => {
      clearInterval(timer)
      clearInterval(refreshTimer)
    }
  }, [])

  const fetchDashboardData = async () => {
    try {
      // For now, use mock data
      // In production, this would call analyticsService.getDashboardStats()
      setData(mockDashboardData)
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
      // Use mock data as fallback
      setData(mockDashboardData)
>>>>>>> 416d0a8e00024729bd2acdc2335c39882588cf35
      setLoading(false)
    }
  }

  if (loading) {
    return (
<<<<<<< HEAD
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
        <h1 className="text-3xl font-bold text-gray-900">数据可视化大屏</h1>

        {/* 概览卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-500">测试总数</h3>
              <p className="mt-1 text-3xl font-semibold text-gray-900">
                {data.totalTests}
              </p>
            </div>
          </Card>
          <Card>
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-500">合格数量</h3>
              <p className="mt-1 text-3xl font-semibold text-green-600">
                {data.passedTests}
              </p>
            </div>
          </Card>
          <Card>
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-500">不合格数量</h3>
              <p className="mt-1 text-3xl font-semibold text-red-600">
                {data.failedTests}
              </p>
            </div>
          </Card>
          <Card>
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-500">总体合格率</h3>
              <p className="mt-1 text-3xl font-semibold text-blue-600">
                {data.currentPassRate.toFixed(2)}%
              </p>
            </div>
          </Card>
        </div>

        {/* 图表区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 合格率仪表盘 */}
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">当前合格率</h2>
              <GaugeChart value={data.currentPassRate} />
            </div>
          </Card>

          {/* 测试结果分布饼图 */}
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">测试结果分布</h2>
              <PieChart
                data={[
                  { name: '合格', value: data.passedTests, color: '#10B981' },
                  { name: '不合格', value: data.failedTests, color: '#EF4444' }
                ]}
              />
            </div>
          </Card>

          {/* 每日测试趋势 */}
          <Card className="lg:col-span-2">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">每日测试趋势</h2>
              <LineChart
                data={data.dailyStats}
                lines={[
                  { dataKey: 'total', name: '总数', color: '#3B82F6' },
                  { dataKey: 'passed', name: '合格', color: '#10B981' },
                  { dataKey: 'failed', name: '不合格', color: '#EF4444' }
                ]}
                xDataKey="date"
              />
            </div>
          </Card>

          {/* 批次测试统计 */}
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">批次测试统计</h2>
              <BarChart
                data={data.batchStats}
                bars={[
                  { dataKey: 'passed', name: '合格', color: '#10B981' },
                  { dataKey: 'failed', name: '不合格', color: '#EF4444' }
                ]}
                xDataKey="name"
              />
            </div>
          </Card>

          {/* 批次合格率对比 */}
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">批次合格率对比</h2>
              <BarChart
                data={data.passRateByBatch}
                bars={[
                  { dataKey: 'passRate', name: '合格率(%)', color: '#3B82F6' }
                ]}
                xDataKey="name"
              />
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  )
}
=======
      <div className="min-h-screen bg-gray-900 p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <SkeletonCard key={i} className="bg-gray-800" />
          ))}
        </div>
      </div>
    )
  }

  const { currentMetrics, trendData, deviceDistribution, dailyResults, recentAlerts, topPerformers } = data

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">光伏关断器检测数据大屏</h1>
            <p className="text-gray-400 mt-1">实时监控和数据分析</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-mono">{currentTime.toLocaleTimeString('zh-CN')}</p>
            <p className="text-sm text-gray-400">{formatDate(currentTime, 'yyyy年MM月dd日')}</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Real-time metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <Zap className="h-8 w-8 text-white/80" />
              <span className="text-sm text-white/80">实时</span>
            </div>
            <p className="text-3xl font-bold">
              <CountUp end={currentMetrics.activeTests} duration={1} />
            </p>
            <p className="text-white/80 mt-1">正在测试</p>
          </div>

          <div className="bg-gradient-to-br from-success-600 to-success-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="h-8 w-8 text-white/80" />
              <span className="text-sm text-white/80">今日</span>
            </div>
            <p className="text-3xl font-bold">
              <CountUp end={currentMetrics.todayPass} duration={1} />
            </p>
            <p className="text-white/80 mt-1">合格数</p>
          </div>

          <div className="bg-gradient-to-br from-warning-600 to-warning-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <Thermometer className="h-8 w-8 text-white/80" />
              <span className="text-sm text-white/80">环境</span>
            </div>
            <p className="text-3xl font-bold">
              <CountUp end={currentMetrics.temperature} duration={1} decimals={1} />°C
            </p>
            <p className="text-white/80 mt-1">当前温度</p>
          </div>

          <div className="bg-gradient-to-br from-secondary-600 to-secondary-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <Droplets className="h-8 w-8 text-white/80" />
              <span className="text-sm text-white/80">环境</span>
            </div>
            <p className="text-3xl font-bold">
              <CountUp end={currentMetrics.humidity} duration={1} decimals={1} />%
            </p>
            <p className="text-white/80 mt-1">当前湿度</p>
          </div>
        </div>

        {/* Main charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Trend chart */}
          <div className="lg:col-span-2">
            <Card className="bg-gray-800 border-gray-700 text-white h-full">
              <h3 className="text-lg font-semibold mb-4">测试趋势分析</h3>
              <LineChart 
                data={trendData} 
                height={350}
                options={{
                  scales: {
                    y: {
                      type: 'linear',
                      display: true,
                      position: 'left',
                      grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                      },
                      ticks: {
                        color: '#9CA3AF'
                      }
                    },
                    y1: {
                      type: 'linear',
                      display: true,
                      position: 'right',
                      grid: {
                        drawOnChartArea: false,
                      },
                      ticks: {
                        color: '#9CA3AF'
                      }
                    },
                    x: {
                      ticks: {
                        color: '#9CA3AF'
                      }
                    }
                  },
                  plugins: {
                    legend: {
                      labels: {
                        color: '#fff'
                      }
                    }
                  }
                }}
              />
            </Card>
          </div>

          {/* Pass rate gauge */}
          <Card className="bg-gray-800 border-gray-700 text-white">
            <h3 className="text-lg font-semibold mb-4 text-center">总体合格率</h3>
            <GaugeChart 
              value={currentMetrics.overallPassRate} 
              title="优秀"
              height={250}
            />
            <div className="grid grid-cols-3 gap-2 mt-4">
              <div className="text-center p-2 bg-danger-900/30 rounded">
                <p className="text-xs text-danger-400">低</p>
                <p className="text-sm font-bold">&lt;60%</p>
              </div>
              <div className="text-center p-2 bg-warning-900/30 rounded">
                <p className="text-xs text-warning-400">中</p>
                <p className="text-sm font-bold">60-90%</p>
              </div>
              <div className="text-center p-2 bg-success-900/30 rounded">
                <p className="text-xs text-success-400">高</p>
                <p className="text-sm font-bold">&gt;90%</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Secondary charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Daily results */}
          <Card className="bg-gray-800 border-gray-700 text-white">
            <h3 className="text-lg font-semibold mb-4">本周测试结果</h3>
            <BarChart 
              data={dailyResults} 
              height={250}
              stacked
              options={{
                scales: {
                  x: {
                    ticks: {
                      color: '#9CA3AF'
                    },
                    grid: {
                      display: false
                    }
                  },
                  y: {
                    ticks: {
                      color: '#9CA3AF'
                    },
                    grid: {
                      color: 'rgba(255, 255, 255, 0.1)'
                    }
                  }
                },
                plugins: {
                  legend: {
                    labels: {
                      color: '#fff'
                    }
                  }
                }
              }}
            />
          </Card>

          {/* Device distribution */}
          <Card className="bg-gray-800 border-gray-700 text-white">
            <h3 className="text-lg font-semibold mb-4">设备型号分布</h3>
            <PieChart 
              data={deviceDistribution} 
              height={250}
              isDoughnut
              options={{
                plugins: {
                  legend: {
                    labels: {
                      color: '#fff'
                    }
                  }
                }
              }}
            />
          </Card>

          {/* Alerts and top performers */}
          <div className="space-y-6">
            {/* Recent alerts */}
            <Card className="bg-gray-800 border-gray-700 text-white">
              <h3 className="text-lg font-semibold mb-4">最新告警</h3>
              <div className="space-y-3">
                {recentAlerts.map(alert => (
                  <div key={alert.id} className={`p-3 rounded-lg flex items-start gap-3 ${
                    alert.type === 'error' ? 'bg-danger-900/30' : 
                    alert.type === 'warning' ? 'bg-warning-900/30' : 
                    'bg-primary-900/30'
                  }`}>
                    <AlertTriangle className={`h-5 w-5 mt-0.5 ${
                      alert.type === 'error' ? 'text-danger-400' : 
                      alert.type === 'warning' ? 'text-warning-400' : 
                      'text-primary-400'
                    }`} />
                    <div className="flex-1">
                      <p className="text-sm">{alert.message}</p>
                      <p className="text-xs text-gray-400 mt-1">{alert.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Top performers */}
            <Card className="bg-gray-800 border-gray-700 text-white">
              <h3 className="text-lg font-semibold mb-4">优秀操作员</h3>
              <div className="space-y-3">
                {topPerformers.map((performer, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        index === 0 ? 'bg-yellow-500' : 
                        index === 1 ? 'bg-gray-400' : 
                        'bg-orange-600'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{performer.name}</p>
                        <p className="text-xs text-gray-400">{performer.tests} 次测试</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-success-400">{formatPercent(performer.passRate)}</p>
                      <p className="text-xs text-gray-400">合格率</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default withAuth(VisualizationPage)
>>>>>>> 416d0a8e00024729bd2acdc2335c39882588cf35
