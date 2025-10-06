import { useState } from 'react'
import { useRouter } from 'next/router'
import Layout from '@/components/layout/Layout'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import FileUploader from '@/components/data-import/FileUploader'
import DataPreview from '@/components/data-import/DataPreview'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import * as XLSX from 'xlsx'

export default function DataImport() {
  const { user } = useAuth()
  const router = useRouter()
  const [file, setFile] = useState(null)
  const [previewData, setPreviewData] = useState(null)
  const [loading, setLoading] = useState(false)

  if (!user) {
    router.push('/auth/login')
    return null
  }

  const handleFileSelect = async (selectedFile) => {
    setFile(selectedFile)
    
    try {
      const data = await readExcelFile(selectedFile)
      setPreviewData(data)
    } catch (error) {
      console.error('读取文件失败:', error)
      toast.error('读取文件失败，请检查文件格式')
    }
  }

  const readExcelFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        try {
          const data = e.target.result
          const workbook = XLSX.read(data, { type: 'binary' })
          const sheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[sheetName]
          const jsonData = XLSX.utils.sheet_to_json(worksheet)
          
          resolve(jsonData)
        } catch (error) {
          reject(error)
        }
      }
      
      reader.onerror = reject
      reader.readAsBinaryString(file)
    })
  }

  const handleImport = async () => {
    if (!previewData || previewData.length === 0) {
      toast.error('没有数据可导入')
      return
    }

    setLoading(true)

    try {
      // 创建批次
      const batchName = file.name.replace(/\.[^/.]+$/, '')
      const { data: batch, error: batchError } = await supabase
        .from('test_batches')
        .insert({
          batch_name: batchName,
          description: `从文件 ${file.name} 导入`,
          test_count: previewData.length,
          created_by: user.id
        })
        .select()
        .single()

      if (batchError) throw batchError

      // 准备测试数据
      const testData = previewData.map(row => ({
        batch_id: batch.id,
        product_serial: row['产品序列号'] || row['Serial Number'] || '',
        test_voltage: parseFloat(row['测试电压'] || row['Test Voltage'] || 0),
        test_current: parseFloat(row['测试电流'] || row['Test Current'] || 0),
        internal_resistance: parseFloat(row['内阻'] || row['Internal Resistance'] || 0),
        temperature: parseFloat(row['温度'] || row['Temperature'] || 25),
        test_result: row['测试结果'] || row['Test Result'] || 'PASS',
        test_time: row['测试时间'] || row['Test Time'] || new Date().toISOString(),
        created_by: user.id
      }))

      // 批量插入测试数据
      const { error: dataError } = await supabase
        .from('test_data')
        .insert(testData)

      if (dataError) throw dataError

      toast.success(`成功导入 ${testData.length} 条数据`)
      router.push('/data')
    } catch (error) {
      console.error('导入失败:', error)
      toast.error('导入失败，请检查数据格式')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">数据导入</h1>
          <Button
            variant="outline"
            onClick={() => router.push('/data')}
          >
            返回数据管理
          </Button>
        </div>

        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">选择文件</h2>
            <FileUploader onFileSelect={handleFileSelect} />
          </div>
        </Card>

        {previewData && (
          <Card>
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  数据预览 ({previewData.length} 条记录)
                </h2>
                <Button
                  onClick={handleImport}
                  loading={loading}
                  disabled={loading}
                >
                  确认导入
                </Button>
              </div>
              <DataPreview data={previewData} />
            </div>
          </Card>
        )}
      </div>
    </Layout>
  )
}
