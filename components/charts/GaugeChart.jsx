import React from 'react'
import { Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js'
import { CHART_COLORS } from '@/config/constants'

ChartJS.register(ArcElement, Tooltip, Legend)

export default function GaugeChart({ 
  value, 
  max = 100,
  title,
  subtitle,
  height = 200,
  thresholds = {
    danger: 60,
    warning: 80,
    success: 90
  }
}) {
  // Determine color based on value
  let color = CHART_COLORS.danger
  if (value >= thresholds.success) {
    color = CHART_COLORS.success
  } else if (value >= thresholds.warning) {
    color = CHART_COLORS.warning
  }

  const data = {
    datasets: [{
      data: [value, max - value],
      backgroundColor: [color, '#E5E7EB'],
      borderWidth: 0,
      cutout: '80%',
      rotation: -90,
      circumference: 180,
    }]
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        enabled: false
      }
    }
  }

  const textCenter = {
    id: 'textCenter',
    beforeDatasetsDraw(chart) {
      const { ctx, chartArea: { width, height } } = chart
      ctx.save()
      
      // Draw value
      ctx.font = 'bold 36px Inter'
      ctx.fillStyle = '#111827'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(`${value}%`, width / 2, height / 2 - 10)
      
      // Draw title
      if (title) {
        ctx.font = '14px Inter'
        ctx.fillStyle = '#6B7280'
        ctx.fillText(title, width / 2, height / 2 + 20)
      }
      
      ctx.restore()
    }
  }

  return (
    <div className="relative" style={{ height }}>
      <Doughnut 
        data={data} 
        options={options} 
        plugins={[textCenter]}
      />
      {subtitle && (
        <p className="text-center text-sm text-gray-600 mt-2">{subtitle}</p>
      )}
    </div>
  )
}