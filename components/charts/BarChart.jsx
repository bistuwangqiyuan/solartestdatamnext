import React from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { Bar } from 'react-chartjs-2'
import { CHART_COLORS } from '@/config/constants'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

export default function BarChart({ 
  data, 
  title, 
  height = 300,
  showLegend = true,
  horizontal = false,
  stacked = false,
  ...props 
}) {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: horizontal ? 'y' : 'x',
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
        stacked,
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
        stacked,
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
    }
  }

  // Apply gradient to datasets
  const processedData = {
    ...data,
    datasets: data.datasets.map((dataset, index) => ({
      ...dataset,
      backgroundColor: (context) => {
        const ctx = context.chart.ctx
        const gradient = ctx.createLinearGradient(0, 0, 0, height)
        const colors = [
          CHART_COLORS.primary,
          CHART_COLORS.secondary,
          CHART_COLORS.success,
          CHART_COLORS.warning,
          CHART_COLORS.danger
        ]
        const color = dataset.backgroundColor || colors[index % colors.length]
        gradient.addColorStop(0, color)
        gradient.addColorStop(1, `${color}CC`)
        return gradient
      },
      borderWidth: 0,
      borderRadius: 4,
      borderSkipped: false,
    }))
  }

  return (
    <div style={{ height }}>
      <Bar options={options} data={processedData} {...props} />
    </div>
  )
}