import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { formatDate, formatDateTime, formatPercent } from '@/utils/format'

// Add Chinese font support
const addChineseFont = (pdf) => {
  // This is a placeholder - in production, you would need to load a proper Chinese font
  pdf.setFont('helvetica')
}

export const reportService = {
  // Generate batch report
  async generateBatchReport(batch, testData) {
    const pdf = new jsPDF('p', 'mm', 'a4')
    addChineseFont(pdf)
    
    // Page dimensions
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const margin = 20
    const contentWidth = pageWidth - (margin * 2)
    
    // Title
    pdf.setFontSize(20)
    pdf.text('Test Batch Report', pageWidth / 2, margin + 10, { align: 'center' })
    
    // Batch info
    let y = margin + 30
    pdf.setFontSize(12)
    pdf.text(`Batch Number: ${batch.batch_number}`, margin, y)
    y += 8
    pdf.text(`Device Model: ${batch.device_model}`, margin, y)
    y += 8
    pdf.text(`Manufacturer: ${batch.manufacturer || '-'}`, margin, y)
    y += 8
    pdf.text(`Test Date: ${formatDate(batch.test_date)}`, margin, y)
    y += 8
    pdf.text(`Operator: ${batch.operator?.name || '-'}`, margin, y)
    
    // Statistics
    y += 15
    pdf.setFontSize(14)
    pdf.text('Test Statistics', margin, y)
    y += 10
    pdf.setFontSize(12)
    
    const passedTests = testData.filter(t => t.result === 'pass').length
    const failedTests = testData.filter(t => t.result === 'fail').length
    const totalTests = testData.length
    const passRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0
    
    pdf.text(`Total Tests: ${totalTests}`, margin, y)
    y += 8
    pdf.text(`Passed: ${passedTests}`, margin, y)
    y += 8
    pdf.text(`Failed: ${failedTests}`, margin, y)
    y += 8
    pdf.text(`Pass Rate: ${formatPercent(passRate)}`, margin, y)
    
    // Test data table
    y += 15
    pdf.setFontSize(14)
    pdf.text('Test Results', margin, y)
    y += 10
    
    // Table headers
    const tableHeaders = ['Test Item', 'Value', 'Unit', 'Standard', 'Result']
    const columnWidths = [50, 30, 20, 30, 25]
    
    pdf.setFontSize(10)
    pdf.setFillColor(240, 240, 240)
    pdf.rect(margin, y, contentWidth, 8, 'F')
    
    let x = margin
    tableHeaders.forEach((header, i) => {
      pdf.text(header, x + 2, y + 5)
      x += columnWidths[i]
    })
    
    y += 10
    
    // Table rows
    testData.forEach((test, index) => {
      if (y > pageHeight - margin - 10) {
        pdf.addPage()
        y = margin
      }
      
      x = margin
      const rowData = [
        test.test_item,
        test.test_value.toString(),
        test.unit,
        test.standard_value?.toString() || '-',
        test.result.toUpperCase()
      ]
      
      rowData.forEach((data, i) => {
        pdf.text(data, x + 2, y + 5)
        x += columnWidths[i]
      })
      
      y += 8
    })
    
    // Footer
    pdf.setFontSize(8)
    pdf.text(`Generated on ${formatDateTime(new Date())}`, pageWidth / 2, pageHeight - 10, { align: 'center' })
    
    return pdf
  },
  
  // Generate summary report
  async generateSummaryReport(data) {
    const pdf = new jsPDF('p', 'mm', 'a4')
    addChineseFont(pdf)
    
    // Implementation would be similar to batch report
    // but with different data structure
    
    return pdf
  },
  
  // Generate report from HTML element
  async generateFromElement(elementId, filename = 'report') {
    const element = document.getElementById(elementId)
    if (!element) {
      throw new Error('Element not found')
    }
    
    const canvas = await html2canvas(element, {
      scale: 2,
      logging: false,
      useCORS: true
    })
    
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('p', 'mm', 'a4')
    
    const imgWidth = pdf.internal.pageSize.getWidth() - 20
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    
    pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight)
    
    return pdf
  },
  
  // Save PDF
  savePDF(pdf, filename) {
    pdf.save(`${filename}_${formatDate(new Date(), 'yyyyMMdd_HHmmss')}.pdf`)
  },
  
  // Get PDF as blob
  getPDFBlob(pdf) {
    return pdf.output('blob')
  },
  
  // Upload report to storage
  async uploadReport(pdf, reportData) {
    const blob = this.getPDFBlob(pdf)
    const filename = `reports/${reportData.type}/${reportData.id}_${Date.now()}.pdf`
    
    // This would upload to Supabase storage
    // For now, return a mock URL
    return {
      url: `/storage/v1/object/public/${filename}`,
      filename
    }
  }
}