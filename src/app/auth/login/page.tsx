'use client'

import { useState, useEffect } from 'react'
import { User, Lock, Eye, EyeOff, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'

// Schéma de validation avec Zod
const loginSchema = z.object({
  username: z.string().min(3, 'Minimum 3 caractères').max(30),
  password: z.string().min(6, 'Minimum 6 caractères')
})

type LoginFormInputs = z.infer<typeof loginSchema>

export default function LoginForm() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [csrfToken, setCsrfToken] = useState('')

  // Récupération du token CSRF (si nécessaire pour votre API)
  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        const res = await fetch('https://agrismart-jclm.onrender.com/api/auth/csrf/', {
          credentials: 'include'
        })
        const data = await res.json()
        setCsrfToken(data.csrfToken)
      } catch (error) {
        console.error('Error fetching CSRF token:', error)
      }
    }
    fetchCsrfToken()
  }, [])

  // Configuration de react-hook-form avec Zod
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema)
  })

  const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
    setIsLoading(true)
    
    try {
      const res = await fetch('https://agrismart-jclm.onrender.com/api/auth/jwt/create/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken
        },
        credentials: 'include',
        body: JSON.stringify(data)
      })

      const responseData = await res.json()

      if (!res.ok) {
        throw new Error(responseData.detail || 'Identifiants invalides')
      }

      // Stockage sécurisé des tokens
      sessionStorage.setItem('access', responseData.access)
      localStorage.setItem('refresh', responseData.refresh)

      // Notification de succès
      toast.success('Connexion réussie! Redirection en cours...')
      
      // Redirection après un délai
      setTimeout(() => {
        router.push('/dashboard')
      }, 1500)

    } catch (error: any) {
      toast.error(`Échec de la connexion: ${error.message}`)
      setError('root', {
        type: 'manual',
        message: error.message
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-8 space-y-6 border border-gray-100">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Connexion AgriSmart</h2>
          <p className="text-sm text-gray-500 mt-2">
            Accédez à votre tableau de bord agricole
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Nom d'utilisateur
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                id="username"
                type="text"
                autoComplete="username"
                className={`w-full pl-10 pr-4 py-2 border ${
                  errors.username ? 'border-red-500' : 'border-gray-300'
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition`}
                {...register('username')}
              />
            </div>
            {errors.username && (
              <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Mot de passe
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                className={`w-full pl-10 pr-10 py-2 border ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition`}
                {...register('password')}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                Se souvenir de moi
              </label>
            </div>

            <div className="text-sm">
              <Link href="/forgot-password" className="font-medium text-green-600 hover:text-green-500">
                Mot de passe oublié?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition ${
              isLoading ? 'opacity-75 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin mr-2 h-4 w-4" />
                Connexion...
              </>
            ) : (
              'Se connecter'
            )}
          </button>

          {errors.root && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-700 text-center">{errors.root.message}</p>
            </div>
          )}
        </form>

        <div className="text-center text-sm text-gray-500">
          Pas encore de compte?{' '}
          <Link href="/register" className="font-medium text-green-600 hover:text-green-500">
            S'inscrire
          </Link>
        </div>
      </div>
    </div>
  )
}