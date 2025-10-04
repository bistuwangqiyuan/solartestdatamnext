import * as XLSX from 'xlsx'
import { formatDate } from './format'

// Excel parsing utilities
export const parseExcelFile = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: 'array' })
        
        // Get the first worksheet
        const worksheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[worksheetName]
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
          header: 1,
          defval: null,
          raw: false
        })
        
        // Parse headers and rows
        const headers = jsonData[0] || []
        const rows = jsonData.slice(1).filter(row => row.some(cell => cell !== null))
        
        resolve({
          headers,
          rows,
          data: rows.map(row => {
            const obj = {}
            headers.forEach((header, index) => {
              obj[header] = row[index]
            })
            return obj
          })
        })
      } catch (error) {
        reject(new Error('Excel文件解析失败: ' + error.message))
      }
    }
    
    reader.onerror = () => {
      reject(new Error('文件读取失败'))
    }
    
    reader.readAsArrayBuffer(file)
  })
}

// Excel export utilities
export const exportToExcel = (data, filename = 'export') => {
  try {
    // Create a new workbook
    const wb = XLSX.utils.book_new()
    
    // Convert data to worksheet
    const ws = XLSX.utils.json_to_sheet(data)
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')
    
    // Generate filename with timestamp
    const timestamp = formatDate(new Date(), 'yyyyMMdd_HHmmss')
    const fullFilename = `${filename}_${timestamp}.xlsx`
    
    // Write the file
    XLSX.writeFile(wb, fullFilename)
    
    return true
  } catch (error) {
    console.error('Excel导出失败:', error)
    return false
  }
}

// Extract test data from Excel row
export const extractTestData = (row, headers) => {
  // Map common Excel column names to our data model
  const columnMappings = {
    '测试项目': 'testItem',
    '测试项': 'testItem',
    'Test Item': 'testItem',
    '测试值': 'testValue',
    '实测值': 'testValue',
    'Test Value': 'testValue',
    '单位': 'unit',
    'Unit': 'unit',
    '标准值': 'standardValue',
    '标准': 'standardValue',
    'Standard': 'standardValue',
    '偏差': 'deviation',
    'Deviation': 'deviation',
    '结果': 'result',
    'Result': 'result',
    '温度': 'temperature',
    'Temperature': 'temperature',
    '湿度': 'humidity',
    'Humidity': 'humidity',
    '电压': 'voltage',
    'Voltage': 'voltage',
    '电流': 'current',
    'Current': 'current',
    '功率': 'power',
    'Power': 'power',
    '设备型号': 'deviceModel',
    '型号': 'deviceModel',
    'Model': 'deviceModel',
    '批次号': 'batchNumber',
    'Batch': 'batchNumber',
    '生产日期': 'productionDate',
    'Production Date': 'productionDate',
    '测试日期': 'testDate',
    'Test Date': 'testDate'
  }
  
  const testData = {}
  
  headers.forEach((header, index) => {
    const mappedKey = columnMappings[header] || header
    const value = row[index]
    
    if (value !== null && value !== undefined && value !== '') {
      // Parse numeric values
      if (['testValue', 'standardValue', 'deviation', 'temperature', 'humidity', 'voltage', 'current', 'power'].includes(mappedKey)) {
        testData[mappedKey] = parseFloat(value) || 0
      }
      // Parse result
      else if (mappedKey === 'result') {
        const resultMap = {
          '合格': 'pass',
          '不合格': 'fail',
          '警告': 'warning',
          'Pass': 'pass',
          'Fail': 'fail',
          'Warning': 'warning'
        }
        testData[mappedKey] = resultMap[value] || value.toLowerCase()
      }
      // Keep as string
      else {
        testData[mappedKey] = String(value).trim()
      }
    }
  })
  
  return testData
}

// Validate Excel data
export const validateExcelData = (data) => {
  const errors = []
  const requiredFields = ['testItem', 'testValue', 'unit']
  
  data.forEach((row, index) => {
    requiredFields.forEach(field => {
      if (!row[field]) {
        errors.push({
          row: index + 2, // +2 because Excel rows start at 1 and we skip header
          field,
          message: `缺少必填字段: ${field}`
        })
      }
    })
    
    // Validate numeric fields
    if (row.testValue && isNaN(parseFloat(row.testValue))) {
      errors.push({
        row: index + 2,
        field: 'testValue',
        message: '测试值必须是数字'
      })
    }
  })
  
  return {
    isValid: errors.length === 0,
    errors
  }
}