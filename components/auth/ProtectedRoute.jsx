import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@/contexts/AuthContext'

export default function ProtectedRoute({ children, requiredRoles = [] }) {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (!loading && user && requiredRoles.length > 0) {
      const hasRequiredRole = requiredRoles.includes(user.profile?.role)
      if (!hasRequiredRole) {
        router.push('/403') // Forbidden page
      }
    }
  }, [user, loading, requiredRoles, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner h-12 w-12" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  if (requiredRoles.length > 0 && !requiredRoles.includes(user.profile?.role)) {
    return null
  }

  return children
}

// HOC version
export function withAuth(Component, requiredRoles = []) {
  return function ProtectedComponent(props) {
    return (
      <ProtectedRoute requiredRoles={requiredRoles}>
        <Component {...props} />
      </ProtectedRoute>
    )
  }
}