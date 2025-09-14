import React from 'react'
import Table from '@/components/ui/Table'
import Badge from '@/components/ui/Badge'
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react'

export default function DataPreview({ data, headers, errors = [] }) {
  // Create columns from headers
  const columns = headers.map((header, index) => ({
    key: header,
    title: header,
    dataIndex: index,
    render: (value) => {
      // Check if this cell has an error
      const cellError = errors.find(err => err.field === header)
      
      if (cellError) {
        return (
          <div className="flex items-center gap-2">
            <span className="text-danger-600">{value || '-'}</span>
            <AlertCircle className="h-4 w-4 text-danger-600" />
          </div>
        )
      }
      
      // Special rendering for result column
      if (header.toLowerCase().includes('结果') || header.toLowerCase() === 'result') {
        const resultMap = {
          'pass': { text: '合格', variant: 'success' },
          '合格': { text: '合格', variant: 'success' },
          'fail': { text: '不合格', variant: 'danger' },
          '不合格': { text: '不合格', variant: 'danger' },
          'warning': { text: '警告', variant: 'warning' },
          '警告': { text: '警告', variant: 'warning' }
        }
        
        const result = resultMap[String(value).toLowerCase()]
        if (result) {
          return <Badge variant={result.variant} size="sm">{result.text}</Badge>
        }
      }
      
      return <span className="text-gray-900">{value || '-'}</span>
    }
  }))

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-success-600" />
          <span className="text-sm font-medium">总行数: {data.length}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">列数: {headers.length}</span>
        </div>
        {errors.length > 0 && (
          <div className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-danger-600" />
            <span className="text-sm text-danger-600">错误: {errors.length}</span>
          </div>
        )}
      </div>

      {/* Error messages */}
      {errors.length > 0 && (
        <div className="p-4 bg-danger-50 border border-danger-200 rounded-lg">
          <h4 className="font-medium text-danger-900 mb-2">数据验证错误</h4>
          <ul className="space-y-1">
            {errors.slice(0, 5).map((error, index) => (
              <li key={index} className="text-sm text-danger-700">
                第 {error.row} 行: {error.message}
              </li>
            ))}
            {errors.length > 5 && (
              <li className="text-sm text-danger-700">
                ... 还有 {errors.length - 5} 个错误
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Data table */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <Table
          columns={columns}
          data={data.slice(0, 10)} // Show first 10 rows
          emptyMessage="没有数据"
        />
        {data.length > 10 && (
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 text-center text-sm text-gray-600">
            仅显示前 10 行数据，共 {data.length} 行
          </div>
        )}
      </div>
    </div>
  )
}