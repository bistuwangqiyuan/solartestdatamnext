import React from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import { CHART_COLORS } from '@/config/constants'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

export default function LineChart({ 
  data, 
  title, 
  height = 300,
  showLegend = true,
  gradient = true,
  ...props 
}) {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: showLegend,
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12
          }
        }
      },
      title: {
        display: !!title,
        text: title,
        font: {
          size: 16,
          weight: 'bold'
        },
        padding: {
          bottom: 20
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#333',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        displayColors: true,
        usePointStyle: true
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 11
          }
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          font: {
            size: 11
          }
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  }

  // Apply gradient to datasets if enabled
  const processedData = gradient ? {
    ...data,
    datasets: data.datasets.map((dataset, index) => ({
      ...dataset,
      borderColor: dataset.borderColor || CHART_COLORS.primary,
      backgroundColor: (context) => {
        const ctx = context.chart.ctx
        const gradient = ctx.createLinearGradient(0, 0, 0, height)
        const color = dataset.borderColor || CHART_COLORS.primary
        gradient.addColorStop(0, `${color}33`)
        gradient.addColorStop(1, `${color}00`)
        return gradient
      },
      fill: true,
      tension: dataset.tension || 0.4,
      pointRadius: 4,
      pointHoverRadius: 6,
      pointBackgroundColor: '#fff',
      pointBorderWidth: 2,
      pointHoverBorderWidth: 3
    }))
  } : data

  return (
    <div style={{ height }}>
      <Line options={options} data={processedData} {...props} />
    </div>
  )
}