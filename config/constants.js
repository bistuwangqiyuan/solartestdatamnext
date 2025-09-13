// Application Constants
export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || '光伏关断器检测数据管理系统'
export const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0'

// API Routes
export const API_ROUTES = {
  BATCHES: '/api/batches',
  TEST_DATA: '/api/test-data',
  ANALYTICS: '/api/analytics',
  REPORTS: '/api/reports',
  USERS: '/api/users',
  AUTH: '/api/auth'
}

// Chart Colors
export const CHART_COLORS = {
  primary: '#0066FF',
  secondary: '#1B2951',
  success: '#00D084',
  warning: '#FF8C00',
  danger: '#FF3B30',
  info: '#17A2B8',
  gradient: {
    primary: ['#0066FF', '#003D99'],
    secondary: ['#1B2951', '#0F1729'],
    success: ['#00D084', '#00A065']
  }
}

// UI Constants
export const UI_CONSTANTS = {
  SIDEBAR_WIDTH: 260,
  HEADER_HEIGHT: 64,
  ANIMATION_DURATION: 300,
  TOAST_DURATION: 3000,
  PAGE_SIZE: 20,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  SUPPORTED_FILE_TYPES: ['.xlsx', '.xls', '.csv']
}

// Test Result Status
export const TEST_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  FAILED: 'failed'
}

// Test Result Types
export const TEST_RESULT = {
  PASS: 'pass',
  FAIL: 'fail',
  WARNING: 'warning',
  NA: 'n/a'
}

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  ENGINEER: 'engineer',
  MANAGER: 'manager',
  VIEWER: 'viewer'
}

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'YYYY-MM-DD HH:mm:ss',
  FILE_NAME: 'YYYY-MM-DD_HHmmss',
  SHORT: 'YYYY-MM-DD',
  TIME: 'HH:mm:ss'
}

// Error Messages
export const ERROR_MESSAGES = {
  GENERIC: '操作失败，请稍后重试',
  NETWORK: '网络连接失败，请检查网络设置',
  AUTH: '认证失败，请重新登录',
  PERMISSION: '权限不足，无法执行此操作',
  FILE_TYPE: '不支持的文件类型',
  FILE_SIZE: '文件大小超过限制',
  DATA_INVALID: '数据格式无效',
  REQUIRED_FIELD: '请填写必填字段'
}

// Success Messages
export const SUCCESS_MESSAGES = {
  SAVE: '保存成功',
  DELETE: '删除成功',
  UPDATE: '更新成功',
  IMPORT: '导入成功',
  EXPORT: '导出成功',
  LOGIN: '登录成功',
  LOGOUT: '退出成功'
}