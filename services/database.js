import { supabase } from '@/lib/supabase'

// Generic database service functions
export const databaseService = {
  // Create
  async create(table, data) {
    const { data: result, error } = await supabase
      .from(table)
      .insert(data)
      .select()
      .single()
    
    if (error) throw error
    return result
  },

  // Read
  async getById(table, id) {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  async getAll(table, options = {}) {
    let query = supabase.from(table).select('*')
    
    // Apply filters
    if (options.filters) {
      Object.entries(options.filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          query = query.eq(key, value)
        }
      })
    }
    
    // Apply sorting
    if (options.orderBy) {
      query = query.order(options.orderBy, { ascending: options.ascending ?? true })
    }
    
    // Apply pagination
    if (options.page && options.pageSize) {
      const from = (options.page - 1) * options.pageSize
      const to = from + options.pageSize - 1
      query = query.range(from, to)
    }
    
    const { data, error, count } = await query
    
    if (error) throw error
    return { data, count }
  },

  // Update
  async update(table, id, data) {
    const { data: result, error } = await supabase
      .from(table)
      .update(data)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return result
  },

  // Delete
  async delete(table, id) {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id)
    
    if (error) throw error
    return true
  },

  // Batch operations
  async createMany(table, dataArray) {
    const { data, error } = await supabase
      .from(table)
      .insert(dataArray)
      .select()
    
    if (error) throw error
    return data
  },

  async deleteMany(table, ids) {
    const { error } = await supabase
      .from(table)
      .delete()
      .in('id', ids)
    
    if (error) throw error
    return true
  }
}

// Specific services for each table
export const profileService = {
  async getProfile(userId) {
    return databaseService.getById('profiles', userId)
  },

  async updateProfile(userId, data) {
    return databaseService.update('profiles', userId, data)
  },

  async getAllProfiles(options) {
    return databaseService.getAll('profiles', options)
  }
}

export const deviceService = {
  async createDevice(data) {
    return databaseService.create('devices', data)
  },

  async getDevice(id) {
    return databaseService.getById('devices', id)
  },

  async getAllDevices(options) {
    return databaseService.getAll('devices', options)
  },

  async updateDevice(id, data) {
    return databaseService.update('devices', id, data)
  },

  async deleteDevice(id) {
    return databaseService.delete('devices', id)
  }
}

export const batchService = {
  async createBatch(data) {
    return databaseService.create('test_batches', data)
  },

  async getBatch(id) {
    const { data, error } = await supabase
      .from('test_batches')
      .select(`
        *,
        operator:profiles(id, name, email),
        test_data(*)
      `)
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  async getAllBatches(options) {
    let query = supabase
      .from('test_batches')
      .select(`
        *,
        operator:profiles(id, name, email)
      `, { count: 'exact' })
    
    // Apply filters
    if (options.filters) {
      Object.entries(options.filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          query = query.eq(key, value)
        }
      })
    }
    
    // Apply date range filter
    if (options.dateRange) {
      if (options.dateRange.start) {
        query = query.gte('test_date', options.dateRange.start)
      }
      if (options.dateRange.end) {
        query = query.lte('test_date', options.dateRange.end)
      }
    }
    
    // Apply sorting
    if (options.orderBy) {
      query = query.order(options.orderBy, { ascending: options.ascending ?? false })
    } else {
      query = query.order('created_at', { ascending: false })
    }
    
    // Apply pagination
    if (options.page && options.pageSize) {
      const from = (options.page - 1) * options.pageSize
      const to = from + options.pageSize - 1
      query = query.range(from, to)
    }
    
    const { data, error, count } = await query
    
    if (error) throw error
    return { data, count }
  },

  async updateBatch(id, data) {
    return databaseService.update('test_batches', id, data)
  },

  async deleteBatch(id) {
    return databaseService.delete('test_batches', id)
  }
}

export const testDataService = {
  async createTestData(data) {
    return databaseService.create('test_data', data)
  },

  async createManyTestData(dataArray) {
    return databaseService.createMany('test_data', dataArray)
  },

  async getTestData(id) {
    return databaseService.getById('test_data', id)
  },

  async getTestDataByBatch(batchId, options = {}) {
    let query = supabase
      .from('test_data')
      .select('*')
      .eq('batch_id', batchId)
    
    if (options.orderBy) {
      query = query.order(options.orderBy, { ascending: options.ascending ?? true })
    }
    
    const { data, error } = await query
    
    if (error) throw error
    return data
  },

  async updateTestData(id, data) {
    return databaseService.update('test_data', id, data)
  },

  async deleteTestData(id) {
    return databaseService.delete('test_data', id)
  }
}

export const reportService = {
  async createReport(data) {
    return databaseService.create('reports', data)
  },

  async getReport(id) {
    const { data, error } = await supabase
      .from('reports')
      .select(`
        *,
        generated_by:profiles(id, name, email),
        batch:test_batches(id, batch_number, device_model)
      `)
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  async getAllReports(options) {
    let query = supabase
      .from('reports')
      .select(`
        *,
        generated_by:profiles(id, name, email),
        batch:test_batches(id, batch_number, device_model)
      `, { count: 'exact' })
    
    // Apply filters
    if (options.filters) {
      Object.entries(options.filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          query = query.eq(key, value)
        }
      })
    }
    
    // Apply sorting
    query = query.order('created_at', { ascending: false })
    
    // Apply pagination
    if (options.page && options.pageSize) {
      const from = (options.page - 1) * options.pageSize
      const to = from + options.pageSize - 1
      query = query.range(from, to)
    }
    
    const { data, error, count } = await query
    
    if (error) throw error
    return { data, count }
  },

  async updateReport(id, data) {
    return databaseService.update('reports', id, data)
  },

  async deleteReport(id) {
    return databaseService.delete('reports', id)
  }
}

export const alertService = {
  async createAlert(data) {
    return databaseService.create('alerts', data)
  },

  async getUserAlerts(userId, options = {}) {
    let query = supabase
      .from('alerts')
      .select(`
        *,
        batch:test_batches(id, batch_number, device_model)
      `)
      .eq('user_id', userId)
    
    if (options.unreadOnly) {
      query = query.eq('read', false)
    }
    
    query = query.order('created_at', { ascending: false })
    
    if (options.limit) {
      query = query.limit(options.limit)
    }
    
    const { data, error } = await query
    
    if (error) throw error
    return data
  },

  async markAsRead(alertId) {
    return databaseService.update('alerts', alertId, { read: true })
  },

  async markAllAsRead(userId) {
    const { error } = await supabase
      .from('alerts')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false)
    
    if (error) throw error
    return true
  },

  async deleteAlert(id) {
    return databaseService.delete('alerts', id)
  }
}

// Analytics service
export const analyticsService = {
  async getDashboardStats() {
    // Get overall statistics
    const { data: stats, error: statsError } = await supabase
      .rpc('get_dashboard_stats')
    
    if (statsError) throw statsError
    
    // Get recent alerts
    const { data: alerts, error: alertsError } = await supabase
      .from('alerts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)
    
    if (alertsError) throw alertsError
    
    // Get test trends (last 30 days)
    const { data: trends, error: trendsError } = await supabase
      .rpc('get_test_trends', { days: 30 })
    
    if (trendsError) throw trendsError
    
    return {
      ...stats,
      recentAlerts: alerts,
      testTrends: trends
    }
  },

  async getBatchAnalytics(batchId) {
    const { data, error } = await supabase
      .from('test_data')
      .select('test_item, test_value, standard_value, deviation, result')
      .eq('batch_id', batchId)
    
    if (error) throw error
    
    // Process data for analytics
    const analytics = {
      totalTests: data.length,
      passedTests: data.filter(d => d.result === 'pass').length,
      failedTests: data.filter(d => d.result === 'fail').length,
      warningTests: data.filter(d => d.result === 'warning').length,
      testItems: [...new Set(data.map(d => d.test_item))],
      deviationStats: calculateDeviationStats(data)
    }
    
    return analytics
  }
}

// Helper functions
function calculateDeviationStats(data) {
  const deviations = data
    .filter(d => d.deviation !== null)
    .map(d => Math.abs(d.deviation))
  
  if (deviations.length === 0) {
    return { min: 0, max: 0, avg: 0 }
  }
  
  return {
    min: Math.min(...deviations),
    max: Math.max(...deviations),
    avg: deviations.reduce((a, b) => a + b, 0) / deviations.length
  }
}