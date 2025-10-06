import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '@/components/layout/Layout'
import Card from '@/components/ui/Card'
import LineChart from '@/components/charts/LineChart'
import BarChart from '@/components/charts/BarChart'
import PieChart from '@/components/charts/PieChart'
import GaugeChart from '@/components/charts/GaugeChart'
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
      setLoading(false)
    }
  }

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
