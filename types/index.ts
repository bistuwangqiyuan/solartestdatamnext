// Type definitions for the Solar Test Data Management System

// User Types
export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  avatar?: string
  createdAt: string
  updatedAt: string
}

export type UserRole = 'admin' | 'engineer' | 'manager' | 'viewer'

// Test Batch Types
export interface TestBatch {
  id: string
  batchNumber: string
  deviceModel: string
  manufacturer: string
  productionDate: string
  testDate: string
  operatorId: string
  operator?: User
  status: BatchStatus
  totalTests: number
  passedTests: number
  failedTests: number
  passRate: number
  createdAt: string
  updatedAt: string
}

export type BatchStatus = 'pending' | 'in_progress' | 'completed' | 'failed'

// Test Data Types
export interface TestData {
  id: string
  batchId: string
  batch?: TestBatch
  testItem: string
  testValue: number
  unit: string
  standardValue: number
  deviation: number
  result: TestResult
  testConditions: TestConditions
  createdAt: string
}

export type TestResult = 'pass' | 'fail' | 'warning' | 'n/a'

export interface TestConditions {
  temperature: number
  humidity: number
  pressure: number
  voltage?: number
  current?: number
  [key: string]: any
}

// Device Types
export interface Device {
  id: string
  deviceCode: string
  deviceName: string
  specifications: DeviceSpecifications
  certification: string
  createdAt: string
  updatedAt: string
}

export interface DeviceSpecifications {
  ratedPower: number
  ratedVoltage: number
  ratedCurrent: number
  maxVoltage: number
  maxCurrent: number
  operatingTemp: {
    min: number
    max: number
  }
  [key: string]: any
}

// Analytics Types
export interface DashboardStats {
  totalBatches: number
  totalTests: number
  overallPassRate: number
  todayTests: number
  weeklyGrowth: number
  monthlyGrowth: number
  recentAlerts: Alert[]
  testTrends: TrendData[]
}

export interface TrendData {
  date: string
  value: number
  label: string
}

export interface Alert {
  id: string
  type: 'error' | 'warning' | 'info'
  title: string
  message: string
  timestamp: string
  read: boolean
}

// Report Types
export interface Report {
  id: string
  name: string
  type: ReportType
  batchId?: string
  dateRange: {
    start: string
    end: string
  }
  generatedBy: string
  generatedAt: string
  fileUrl: string
  status: 'generating' | 'completed' | 'failed'
}

export type ReportType = 'daily' | 'weekly' | 'monthly' | 'batch' | 'custom'

// Import/Export Types
export interface ImportResult {
  success: boolean
  totalRows: number
  importedRows: number
  failedRows: number
  errors: ImportError[]
}

export interface ImportError {
  row: number
  field: string
  message: string
}

// Chart Data Types
export interface ChartData {
  labels: string[]
  datasets: ChartDataset[]
}

export interface ChartDataset {
  label: string
  data: number[]
  backgroundColor?: string | string[]
  borderColor?: string
  borderWidth?: number
  fill?: boolean
  tension?: number
}

// Filter Types
export interface FilterOptions {
  dateRange?: {
    start: string
    end: string
  }
  deviceModel?: string[]
  manufacturer?: string[]
  testResult?: TestResult[]
  operator?: string[]
  batchStatus?: BatchStatus[]
}

// Pagination Types
export interface PaginationParams {
  page: number
  pageSize: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}