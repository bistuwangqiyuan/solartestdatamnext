<<<<<<< HEAD
import { useState } from 'react'
=======
import React, { useState } from 'react'
>>>>>>> 416d0a8e00024729bd2acdc2335c39882588cf35
import { useRouter } from 'next/router'
import Layout from '@/components/layout/Layout'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
<<<<<<< HEAD
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
=======
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Modal from '@/components/ui/Modal'
import FileUploader from '@/components/data-import/FileUploader'
import DataPreview from '@/components/data-import/DataPreview'
import { withAuth } from '@/components/auth/ProtectedRoute'
import { parseExcelFile, extractTestData, validateExcelData } from '@/utils/excel'
import { batchService, testDataService } from '@/services/database'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'
import { FileSpreadsheet, Upload, CheckCircle } from 'lucide-react'
import { cn } from '@/utils/cn'

const steps = [
  { id: 1, name: '选择文件', icon: FileSpreadsheet },
  { id: 2, name: '数据预览', icon: Upload },
  { id: 3, name: '批次信息', icon: CheckCircle },
]

function ImportPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [file, setFile] = useState(null)
  const [parsedData, setParsedData] = useState(null)
  const [validationErrors, setValidationErrors] = useState([])
  const [batchInfo, setBatchInfo] = useState({
    batchNumber: '',
    deviceModel: '',
    manufacturer: '',
    productionDate: '',
    testDate: new Date().toISOString().split('T')[0],
  })
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState(null)

  const handleFileSelect = async (selectedFile) => {
    setFile(selectedFile)
    setParsedData(null)
    setValidationErrors([])
    
    if (selectedFile) {
      try {
        const { headers, rows, data } = await parseExcelFile(selectedFile)
        
        // Extract test data from rows
        const testData = rows.map(row => extractTestData(row, headers))
        
        // Validate data
        const validation = validateExcelData(testData)
        
        setParsedData({ headers, rows, testData })
        setValidationErrors(validation.errors)
        
        // Auto-fill batch info if available
        if (testData.length > 0) {
          const firstRow = testData[0]
          setBatchInfo(prev => ({
            ...prev,
            deviceModel: firstRow.deviceModel || prev.deviceModel,
            batchNumber: firstRow.batchNumber || prev.batchNumber,
            productionDate: firstRow.productionDate || prev.productionDate,
            testDate: firstRow.testDate || prev.testDate,
          }))
        }
        
        // Move to next step
        setCurrentStep(2)
      } catch (error) {
        toast.error('文件解析失败: ' + error.message)
      }
    }
  }

  const handleImport = async () => {
    if (!parsedData || validationErrors.length > 0) {
      toast.error('请先修正数据错误')
      return
    }
    
    setImporting(true)
    
    try {
      // Create batch
      const batch = await batchService.createBatch({
        ...batchInfo,
        operatorId: user.id,
        status: 'completed',
      })
      
      // Prepare test data
      const testDataToImport = parsedData.testData.map(data => ({
        ...data,
        batchId: batch.id,
      }))
      
      // Import test data
      const importedData = await testDataService.createManyTestData(testDataToImport)
      
      setImportResult({
        success: true,
        batchId: batch.id,
        totalRows: importedData.length,
      })
      
      toast.success(`成功导入 ${importedData.length} 条测试数据`)
      
      // Show success modal
      setTimeout(() => {
        router.push(`/data/batches/${batch.id}`)
      }, 2000)
    } catch (error) {
      toast.error('导入失败: ' + error.message)
      setImportResult({
        success: false,
        error: error.message,
      })
    } finally {
      setImporting(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card title="选择Excel文件" subtitle="支持 .xlsx, .xls, .csv 格式">
            <FileUploader onFileSelect={handleFileSelect} />
          </Card>
        )
      
      case 2:
        return (
          <Card 
            title="数据预览" 
            subtitle="请检查数据是否正确"
            actions={
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setCurrentStep(1)}>
                  重新选择
                </Button>
                <Button 
                  onClick={() => setCurrentStep(3)}
                  disabled={validationErrors.length > 0}
                >
                  下一步
                </Button>
              </div>
            }
          >
            {parsedData && (
              <DataPreview
                data={parsedData.rows}
                headers={parsedData.headers}
                errors={validationErrors}
              />
            )}
          </Card>
        )
      
      case 3:
        return (
          <Card 
            title="批次信息" 
            subtitle="请填写测试批次信息"
            actions={
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setCurrentStep(2)}>
                  上一步
                </Button>
                <Button 
                  onClick={handleImport}
                  loading={importing}
                  disabled={!batchInfo.batchNumber || !batchInfo.deviceModel}
                >
                  开始导入
                </Button>
              </div>
            }
          >
            <div className="grid grid-cols-2 gap-6">
              <Input
                label="批次号"
                required
                value={batchInfo.batchNumber}
                onChange={(e) => setBatchInfo(prev => ({ ...prev, batchNumber: e.target.value }))}
                placeholder="请输入批次号"
              />
              
              <Input
                label="设备型号"
                required
                value={batchInfo.deviceModel}
                onChange={(e) => setBatchInfo(prev => ({ ...prev, deviceModel: e.target.value }))}
                placeholder="请输入设备型号"
              />
              
              <Input
                label="制造商"
                value={batchInfo.manufacturer}
                onChange={(e) => setBatchInfo(prev => ({ ...prev, manufacturer: e.target.value }))}
                placeholder="请输入制造商"
              />
              
              <Input
                label="生产日期"
                type="date"
                value={batchInfo.productionDate}
                onChange={(e) => setBatchInfo(prev => ({ ...prev, productionDate: e.target.value }))}
              />
              
              <Input
                label="测试日期"
                type="date"
                required
                value={batchInfo.testDate}
                onChange={(e) => setBatchInfo(prev => ({ ...prev, testDate: e.target.value }))}
              />
              
              <div className="col-span-2 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  将导入 <span className="font-medium text-gray-900">{parsedData?.testData.length || 0}</span> 条测试数据
                </p>
              </div>
            </div>
          </Card>
        )
      
      default:
        return null
>>>>>>> 416d0a8e00024729bd2acdc2335c39882588cf35
    }
  }

  return (
    <Layout>
      <div className="space-y-6">
<<<<<<< HEAD
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
=======
        {/* Page header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">数据导入</h1>
          <p className="text-gray-600 mt-1">从Excel文件批量导入测试数据</p>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center justify-center mb-8">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div className="flex items-center">
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center',
                    currentStep >= step.id
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  )}
                >
                  <step.icon className="h-5 w-5" />
                </div>
                <span
                  className={cn(
                    'ml-3 text-sm font-medium',
                    currentStep >= step.id ? 'text-gray-900' : 'text-gray-500'
                  )}
                >
                  {step.name}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'w-24 h-0.5 mx-4',
                    currentStep > step.id ? 'bg-primary-600' : 'bg-gray-200'
                  )}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step content */}
        {renderStepContent()}

        {/* Import result modal */}
        <Modal
          isOpen={importResult !== null}
          onClose={() => setImportResult(null)}
          title={importResult?.success ? '导入成功' : '导入失败'}
          size="sm"
        >
          {importResult?.success ? (
            <div className="text-center py-4">
              <CheckCircle className="h-12 w-12 text-success-600 mx-auto mb-4" />
              <p className="text-gray-600">
                成功导入 {importResult.totalRows} 条测试数据
              </p>
              <p className="text-sm text-gray-500 mt-2">
                正在跳转到批次详情页...
              </p>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-danger-600">
                {importResult?.error || '导入过程中发生错误'}
              </p>
            </div>
          )}
        </Modal>
>>>>>>> 416d0a8e00024729bd2acdc2335c39882588cf35
      </div>
    </Layout>
  )
}
<<<<<<< HEAD
=======

export default withAuth(ImportPage, ['admin', 'engineer'])
>>>>>>> 416d0a8e00024729bd2acdc2335c39882588cf35
