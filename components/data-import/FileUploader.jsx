import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { cn } from '@/utils/cn'
import { Upload, FileSpreadsheet, X, AlertCircle } from 'lucide-react'
import Button from '@/components/ui/Button'
import { formatFileSize } from '@/utils/format'
import { UI_CONSTANTS } from '@/config/constants'

export default function FileUploader({ onFileSelect, accept = UI_CONSTANTS.SUPPORTED_FILE_TYPES, maxSize = UI_CONSTANTS.MAX_FILE_SIZE }) {
  const [file, setFile] = useState(null)
  const [error, setError] = useState(null)

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    setError(null)
    
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0]
      if (rejection.errors[0]?.code === 'file-too-large') {
        setError(`文件大小超过限制 (最大 ${formatFileSize(maxSize)})`)
      } else if (rejection.errors[0]?.code === 'file-invalid-type') {
        setError('不支持的文件类型')
      } else {
        setError('文件上传失败')
      }
      return
    }
    
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0]
      setFile(selectedFile)
      onFileSelect(selectedFile)
    }
  }, [onFileSelect, maxSize])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept.reduce((acc, ext) => {
      acc[`application/${ext.replace('.', '')}`] = [ext]
      return acc
    }, {}),
    maxSize,
    multiple: false
  })

  const removeFile = () => {
    setFile(null)
    setError(null)
    onFileSelect(null)
  }

  return (
    <div className="w-full">
      {!file ? (
        <div
          {...getRootProps()}
          className={cn(
            'relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all',
            isDragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-gray-400',
            error && 'border-danger-500 bg-danger-50'
          )}
        >
          <input {...getInputProps()} />
          
          <div className="flex flex-col items-center">
            <div className={cn(
              'p-4 rounded-full mb-4',
              isDragActive ? 'bg-primary-100' : 'bg-gray-100'
            )}>
              <Upload className={cn(
                'h-8 w-8',
                isDragActive ? 'text-primary-600' : 'text-gray-600'
              )} />
            </div>
            
            <p className="text-lg font-medium text-gray-900 mb-1">
              {isDragActive ? '释放文件以上传' : '拖拽文件到此处或点击选择'}
            </p>
            
            <p className="text-sm text-gray-500 mb-4">
              支持格式: {accept.join(', ')} (最大 {formatFileSize(maxSize)})
            </p>
            
            <Button variant="outline" size="sm">
              选择文件
            </Button>
          </div>
          
          {error && (
            <div className="absolute bottom-2 left-0 right-0 flex items-center justify-center gap-2 text-danger-600">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}
        </div>
      ) : (
        <div className="border-2 border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-100 rounded-lg">
                <FileSpreadsheet className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{file.name}</p>
                <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
              </div>
            </div>
            <button
              onClick={removeFile}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}