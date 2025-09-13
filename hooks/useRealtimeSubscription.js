import { useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

export function useRealtimeSubscription(table, filter = {}, onUpdate) {
  const subscriptionRef = useRef(null)

  useEffect(() => {
    // Build the subscription
    let subscription = supabase
      .channel(`${table}_changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: table,
          filter: Object.entries(filter)
            .map(([key, value]) => `${key}=eq.${value}`)
            .join('&')
        },
        (payload) => {
          console.log('Realtime update:', payload)
          
          if (onUpdate) {
            onUpdate(payload)
          }
          
          // Show toast notifications for certain events
          switch (payload.eventType) {
            case 'INSERT':
              if (table === 'test_batches') {
                toast.success('新的测试批次已创建')
              } else if (table === 'alerts') {
                toast.warning('收到新的告警')
              }
              break
            case 'UPDATE':
              if (table === 'test_batches' && payload.new.status === 'completed') {
                toast.success('测试批次已完成')
              }
              break
            case 'DELETE':
              // Handle delete events if needed
              break
          }
        }
      )
      .subscribe()

    subscriptionRef.current = subscription

    // Cleanup
    return () => {
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current)
      }
    }
  }, [table, JSON.stringify(filter)])

  return subscriptionRef.current
}

// Hook for subscribing to multiple tables
export function useMultipleRealtimeSubscriptions(subscriptions) {
  const subscriptionRefs = useRef([])

  useEffect(() => {
    // Clear existing subscriptions
    subscriptionRefs.current.forEach(sub => {
      supabase.removeChannel(sub)
    })
    subscriptionRefs.current = []

    // Create new subscriptions
    subscriptions.forEach(({ table, filter, onUpdate }) => {
      const subscription = supabase
        .channel(`${table}_${Date.now()}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: table,
            filter: filter ? Object.entries(filter)
              .map(([key, value]) => `${key}=eq.${value}`)
              .join('&') : undefined
          },
          onUpdate
        )
        .subscribe()

      subscriptionRefs.current.push(subscription)
    })

    // Cleanup
    return () => {
      subscriptionRefs.current.forEach(sub => {
        supabase.removeChannel(sub)
      })
    }
  }, [JSON.stringify(subscriptions)])

  return subscriptionRefs.current
}