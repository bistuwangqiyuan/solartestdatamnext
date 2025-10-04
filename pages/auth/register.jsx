<<<<<<< HEAD
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
=======
import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import AuthLayout from '@/components/layout/AuthLayout'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import { useAuth } from '@/contexts/AuthContext'
import { Mail, Lock, User } from 'lucide-react'

const registerSchema = z.object({
  name: z.string().min(2, '姓名至少2个字符'),
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(6, '密码至少6个字符'),
  confirmPassword: z.string(),
  role: z.enum(['viewer', 'engineer', 'manager']),
}).refine((data) => data.password === data.confirmPassword, {
  message: '两次输入的密码不一致',
  path: ['confirmPassword'],
})

const roleOptions = [
  { value: 'viewer', label: '查看者' },
  { value: 'engineer', label: '测试工程师' },
  { value: 'manager', label: '质量主管' },
]

export default function RegisterPage() {
  const router = useRouter()
  const { signUp } = useAuth()
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'viewer',
    },
  })

  const onSubmit = async (data) => {
    setLoading(true)
    const { confirmPassword, ...userData } = data
    const result = await signUp(userData)
    setLoading(false)
    
    if (result.success) {
      router.push('/dashboard')
>>>>>>> 416d0a8e00024729bd2acdc2335c39882588cf35
    }
  }

  return (
<<<<<<< HEAD
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
=======
    <AuthLayout
      title="创建新账号"
      subtitle={
        <>
          已有账号？{' '}
          <Link href="/auth/login" className="text-primary-600 hover:text-primary-700">
            立即登录
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Input
          label="姓名"
          type="text"
          placeholder="请输入您的姓名"
          leftIcon={<User className="h-5 w-5" />}
          error={errors.name?.message}
          {...register('name')}
        />

        <Input
          label="邮箱地址"
          type="email"
          placeholder="请输入邮箱"
          leftIcon={<Mail className="h-5 w-5" />}
          error={errors.email?.message}
          {...register('email')}
        />

        <Select
          label="用户角色"
          options={roleOptions}
          error={errors.role?.message}
          {...register('role')}
        />

        <Input
          label="密码"
          type="password"
          placeholder="请输入密码"
          leftIcon={<Lock className="h-5 w-5" />}
          error={errors.password?.message}
          {...register('password')}
        />

        <Input
          label="确认密码"
          type="password"
          placeholder="请再次输入密码"
          leftIcon={<Lock className="h-5 w-5" />}
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <div className="text-sm text-gray-600">
          注册即表示您同意我们的
          <Link href="/terms" className="text-primary-600 hover:text-primary-700">
            服务条款
          </Link>
          和
          <Link href="/privacy" className="text-primary-600 hover:text-primary-700">
            隐私政策
          </Link>
        </div>

        <Button
          type="submit"
          fullWidth
>>>>>>> 416d0a8e00024729bd2acdc2335c39882588cf35
          loading={loading}
        >
          注册
        </Button>
<<<<<<< HEAD
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
=======
      </form>
    </AuthLayout>
  )
}
>>>>>>> 416d0a8e00024729bd2acdc2335c39882588cf35
