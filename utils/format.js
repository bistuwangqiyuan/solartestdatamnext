import { format, parseISO } from 'date-fns'
import { zhCN } from 'date-fns/locale'

// Date formatting utilities
export const formatDate = (date, formatStr = 'yyyy-MM-dd') => {
  if (!date) return ''
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return format(dateObj, formatStr, { locale: zhCN })
}

export const formatDateTime = (date) => {
  return formatDate(date, 'yyyy-MM-dd HH:mm:ss')
}

export const formatTime = (date) => {
  return formatDate(date, 'HH:mm:ss')
}

export const formatRelativeTime = (date) => {
  if (!date) return ''
  const now = new Date()
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  const diff = now - dateObj
  
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 30) return `${days}天前`
  
  return formatDate(dateObj)
}

// Number formatting utilities
export const formatNumber = (num, decimals = 0) => {
  if (num === null || num === undefined) return '-'
  return new Intl.NumberFormat('zh-CN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(num)
}

export const formatPercent = (num, decimals = 1) => {
  if (num === null || num === undefined) return '-'
  return `${formatNumber(num, decimals)}%`
}

export const formatCurrency = (num) => {
  if (num === null || num === undefined) return '-'
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY'
  }).format(num)
}

// File size formatting
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Status formatting
export const formatTestResult = (result) => {
  const statusMap = {
    pass: { text: '合格', color: 'text-success-600' },
    fail: { text: '不合格', color: 'text-danger-600' },
    warning: { text: '警告', color: 'text-warning-600' },
    'n/a': { text: '未测试', color: 'text-gray-600' }
  }
  
  return statusMap[result] || { text: result, color: 'text-gray-600' }
}

export const formatBatchStatus = (status) => {
  const statusMap = {
    pending: { text: '待测试', color: 'text-gray-600' },
    in_progress: { text: '测试中', color: 'text-primary-600' },
    completed: { text: '已完成', color: 'text-success-600' },
    failed: { text: '失败', color: 'text-danger-600' }
  }
  
  return statusMap[status] || { text: status, color: 'text-gray-600' }
}

// String utilities
export const truncate = (str, length = 50) => {
  if (!str) return ''
  return str.length > length ? str.substring(0, length) + '...' : str
}

export const capitalize = (str) => {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export const slugify = (str) => {
  if (!str) return ''
  return str
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-')
}