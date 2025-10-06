import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import AuthLayout from '@/components/layout/AuthLayout'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import toast from 'react-hot-toast'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      toast.error('密码不匹配')
      return
    }

    setLoading(true)

    try {
      const { error } = await signUp(email, password)
      if (!error) {
        toast.success('注册成功！请检查您的邮箱进行验证。')
        router.push('/auth/login')
      }
    } catch (error) {
      toast.error('注册失败，请稍后再试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="注册">
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
        <Input
          label="确认密码"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          placeholder="••••••••"
        />
        <Button
          type="submit"
          className="w-full"
          loading={loading}
        >
          注册
        </Button>
        <p className="text-center text-sm text-gray-600">
          已有账号？{' '}
          <Link href="/auth/login" className="text-primary-600 hover:text-primary-500">
            立即登录
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}
