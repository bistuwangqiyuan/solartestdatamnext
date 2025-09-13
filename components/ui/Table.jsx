import React from 'react'
import { cn } from '@/utils/cn'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Button from './Button'

export default function Table({
  columns,
  data,
  loading = false,
  emptyMessage = '暂无数据',
  className,
  ...props
}) {
  return (
    <div className={cn('w-full overflow-hidden', className)}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200" {...props}>
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={column.key || index}
                  className={cn(
                    'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
                    column.className
                  )}
                  style={column.width ? { width: column.width } : undefined}
                >
                  {column.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center">
                  <div className="flex items-center justify-center">
                    <div className="loading-spinner h-8 w-8" />
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-500">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr key={row.id || rowIndex} className="hover:bg-gray-50">
                  {columns.map((column, colIndex) => (
                    <td
                      key={column.key || colIndex}
                      className={cn(
                        'px-6 py-4 whitespace-nowrap text-sm text-gray-900',
                        column.className
                      )}
                    >
                      {column.render
                        ? column.render(row[column.dataIndex], row, rowIndex)
                        : row[column.dataIndex]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function TablePagination({
  current,
  pageSize,
  total,
  onChange,
  showSizeChanger = true,
  pageSizeOptions = [10, 20, 50, 100],
  className
}) {
  const totalPages = Math.ceil(total / pageSize)
  const startItem = (current - 1) * pageSize + 1
  const endItem = Math.min(current * pageSize, total)

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && page !== current) {
      onChange(page, pageSize)
    }
  }

  const handlePageSizeChange = (e) => {
    const newPageSize = parseInt(e.target.value)
    const newCurrent = Math.ceil(startItem / newPageSize)
    onChange(newCurrent, newPageSize)
  }

  return (
    <div className={cn('flex items-center justify-between px-6 py-3 bg-white border-t border-gray-200', className)}>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-700">
          显示 <span className="font-medium">{startItem}</span> 到{' '}
          <span className="font-medium">{endItem}</span> 条，共{' '}
          <span className="font-medium">{total}</span> 条
        </span>
        
        {showSizeChanger && (
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-700">每页显示</label>
            <select
              value={pageSize}
              onChange={handlePageSizeChange}
              className="px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size} 条
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(current - 1)}
          disabled={current === 1}
          leftIcon={<ChevronLeft className="h-4 w-4" />}
        >
          上一页
        </Button>
        
        <div className="flex items-center gap-1">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum
            if (totalPages <= 5) {
              pageNum = i + 1
            } else if (current <= 3) {
              pageNum = i + 1
            } else if (current >= totalPages - 2) {
              pageNum = totalPages - 4 + i
            } else {
              pageNum = current - 2 + i
            }
            
            return (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={cn(
                  'h-8 w-8 text-sm font-medium rounded-md transition-colors',
                  pageNum === current
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                )}
              >
                {pageNum}
              </button>
            )
          })}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(current + 1)}
          disabled={current === totalPages}
          rightIcon={<ChevronRight className="h-4 w-4" />}
        >
          下一页
        </Button>
      </div>
    </div>
  )
}