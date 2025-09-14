import React, { useState, useEffect } from 'react'
import { withAuth } from '@/components/auth/ProtectedRoute'
import Card from '@/components/ui/Card'
import { SkeletonCard } from '@/components/ui/Skeleton'
import LineChart from '@/components/charts/LineChart'
import BarChart from '@/components/charts/BarChart'
import PieChart from '@/components/charts/PieChart'
import GaugeChart from '@/components/charts/GaugeChart'
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
      setLoading(false)
    }
  }

  if (loading) {
    return (
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