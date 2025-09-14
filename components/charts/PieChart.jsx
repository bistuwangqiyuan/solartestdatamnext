import React from 'react'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js'
import { Pie, Doughnut } from 'react-chartjs-2'
import { CHART_COLORS } from '@/config/constants'

ChartJS.register(ArcElement, Tooltip, Legend)

export default function PieChart({ 
  data, 
  title, 
  height = 300,
  showLegend = true,
  isDoughnut = false,
  ...props 
}) {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: showLegend,
        position: 'right',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12
          },
          generateLabels: (chart) => {
            const data = chart.data
            if (data.labels.length && data.datasets.length) {
              const dataset = data.datasets[0]
              const total = dataset.data.reduce((a, b) => a + b, 0)
              
              return data.labels.map((label, i) => {
                const value = dataset.data[i]
                const percentage = ((value / total) * 100).toFixed(1)
                
                return {
                  text: `${label}: ${percentage}%`,
                  fillStyle: dataset.backgroundColor[i],
                  hidden: false,
                  index: i
                }
              })
            }
            return []
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
        callbacks: {
          label: (context) => {
            const label = context.label || ''
            const value = context.parsed
            const total = context.dataset.data.reduce((a, b) => a + b, 0)
            const percentage = ((value / total) * 100).toFixed(1)
            return `${label}: ${value} (${percentage}%)`
          }
        }
      }
    }
  }

  // Apply colors to dataset
  const colors = [
    CHART_COLORS.success,
    CHART_COLORS.danger,
    CHART_COLORS.warning,
    CHART_COLORS.primary,
    CHART_COLORS.secondary,
    '#8B5CF6',
    '#EC4899',
    '#14B8A6',
    '#F59E0B',
    '#6B7280'
  ]

  const processedData = {
    ...data,
    datasets: data.datasets.map((dataset) => ({
      ...dataset,
      backgroundColor: dataset.backgroundColor || colors.slice(0, data.labels.length),
      borderWidth: 2,
      borderColor: '#fff',
      hoverBorderColor: '#fff',
      hoverBorderWidth: 3,
      hoverOffset: 4
    }))
  }

  const ChartComponent = isDoughnut ? Doughnut : Pie

  return (
    <div style={{ height }}>
      <ChartComponent options={options} data={processedData} {...props} />
    </div>
  )
}