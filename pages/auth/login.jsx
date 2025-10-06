import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import AuthLayout from '@/components/layout/AuthLayout'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import toast from 'react-hot-toast'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await signIn(email, password)
      if (!error) {
        router.push('/dashboard')
      }
    } catch (error) {
      toast.error('登录失败，请检查您的邮箱和密码')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="登录">
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="邮箱"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="your@email.com"
        />
        <Input
          label="密码"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="••••••••"
        />
        <Button
          type="submit"
          className="w-full"
          loading={loading}
        >
          登录
        </Button>
        <p className="text-center text-sm text-gray-600">
          还没有账号？{' '}
          <Link href="/auth/register" className="text-primary-600 hover:text-primary-500">
            立即注册
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}
