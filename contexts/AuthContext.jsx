import React, { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { authService } from '@/services/auth'
import toast from 'react-hot-toast'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export function AuthProvider({ children }) {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check active session
    checkUser()

    // Listen for auth changes
    const subscription = authService.onAuthStateChange((event, session, user) => {
      if (event === 'SIGNED_IN') {
        setUser(user)
        router.push('/dashboard')
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        router.push('/auth/login')
      } else if (event === 'USER_UPDATED') {
        setUser(user)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const checkUser = async () => {
    try {
      const currentUser = await authService.getCurrentUser()
      setUser(currentUser)
    } catch (error) {
      console.error('Error checking user:', error)
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (credentials) => {
    try {
      const { user } = await authService.signIn(credentials)
      setUser(user)
      toast.success('登录成功')
      return { success: true }
    } catch (error) {
      toast.error(error.message || '登录失败')
      return { success: false, error: error.message }
    }
  }

  const signUp = async (userData) => {
    try {
      const { user } = await authService.signUp(userData)
      setUser(user)
      toast.success('注册成功')
      return { success: true }
    } catch (error) {
      toast.error(error.message || '注册失败')
      return { success: false, error: error.message }
    }
  }

  const signOut = async () => {
    try {
      await authService.signOut()
      setUser(null)
      toast.success('退出成功')
      router.push('/auth/login')
    } catch (error) {
      toast.error('退出失败')
    }
  }

  const updateProfile = async (updates) => {
    try {
      const updatedProfile = await authService.updateProfile(updates)
      setUser(prev => ({
        ...prev,
        profile: updatedProfile
      }))
      toast.success('更新成功')
      return { success: true }
    } catch (error) {
      toast.error(error.message || '更新失败')
      return { success: false, error: error.message }
    }
  }

  const hasRole = (requiredRoles) => {
    if (!user || !user.profile) return false
    
    if (Array.isArray(requiredRoles)) {
      return requiredRoles.includes(user.profile.role)
    }
    
    return user.profile.role === requiredRoles
  }

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    hasRole,
    checkUser
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}