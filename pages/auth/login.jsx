<<<<<<< HEAD
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
=======
import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import AuthLayout from '@/components/layout/AuthLayout'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { useAuth } from '@/contexts/AuthContext'
import { Mail, Lock } from 'lucide-react'

const loginSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(6, '密码至少6个字符'),
})

export default function LoginPage() {
  const router = useRouter()
  const { signIn } = useAuth()
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data) => {
    setLoading(true)
    const result = await signIn(data)
    setLoading(false)
    
    if (result.success) {
      router.push('/dashboard')
>>>>>>> 416d0a8e00024729bd2acdc2335c39882588cf35
    }
  }

  return (
<<<<<<< HEAD
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
=======
    <AuthLayout
      title="登录到系统"
      subtitle={
        <>
          还没有账号？{' '}
          <Link href="/auth/register" className="text-primary-600 hover:text-primary-700">
            立即注册
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Input
          label="邮箱地址"
          type="email"
          placeholder="请输入邮箱"
          leftIcon={<Mail className="h-5 w-5" />}
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="密码"
          type="password"
          placeholder="请输入密码"
          leftIcon={<Lock className="h-5 w-5" />}
          error={errors.password?.message}
          {...register('password')}
        />

        <div className="flex items-center justify-between">
          <label className="flex items-center">
            <input
              type="checkbox"
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-600">记住我</span>
          </label>
          
          <Link
            href="/auth/forgot-password"
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            忘记密码？
          </Link>
        </div>

        <Button
          type="submit"
          fullWidth
>>>>>>> 416d0a8e00024729bd2acdc2335c39882588cf35
          loading={loading}
        >
          登录
        </Button>
<<<<<<< HEAD
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
=======

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">或使用测试账号</span>
          </div>
        </div>

        <div className="space-y-2 text-sm text-gray-600">
          <p>管理员: admin@example.com / password123</p>
          <p>工程师: engineer@example.com / password123</p>
          <p>查看者: viewer@example.com / password123</p>
        </div>
      </form>
    </AuthLayout>
  )
}
>>>>>>> 416d0a8e00024729bd2acdc2335c39882588cf35
