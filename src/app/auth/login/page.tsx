'use client'

import { useState } from 'react'
import { User, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function LoginForm() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [focusedField, setFocusedField] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/jwt/create/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    })

    const data = await res.json()
    setLoading(false)

    if (res.status === 200) {
      // Stocke les tokens
      sessionStorage.setItem('access', data.access)
      localStorage.setItem('refresh', data.refresh)
      router.push('/home')
    } else {
      setMessage(`❌ Erreur: ${data.detail || JSON.stringify(data)}`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2e7d32] via-[#8d6e63] to-[#2e7d32] flex items-center justify-center px-4 relative overflow-hidden">
      
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-4 -left-4 w-72 h-72 bg-green-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-8 -right-4 w-72 h-72 bg-amber-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-lime-200 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse delay-500"></div>
      </div>

      {/* Login Card */}
      <div className="relative w-full max-w-md">
        <div className="absolute inset-0 bg-[rgba(245,245,220,0.1)] backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20"></div>
        <div className="relative bg-white/5 backdrop-blur-sm rounded-3xl p-8 space-y-8 border border-white/10 shadow-2xl">

          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-600 to-amber-500 rounded-2xl mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-white via-lime-100 to-amber-100 bg-clip-text text-transparent">
              Connexion
            </h2>
            <p className="text-gray-200 text-sm">Accédez à votre espace personnel</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-200">
                Nom d'utilisateur
              </label>
              <div className="relative group">
                <User className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors duration-200 ${
                  focusedField === 'username' ? 'text-green-400' : 'text-gray-400'
                }`} size={20} />
                <input
                  type="text"
                  className="w-full bg-white/10 backdrop-blur-sm text-white placeholder-gray-300 pl-12 pr-4 py-3 border border-white/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all duration-200"
                  placeholder="Entrez votre nom d'utilisateur"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onFocus={() => setFocusedField('username')}
                  onBlur={() => setFocusedField('')}
                  required
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-200">
                Mot de passe
              </label>
              <div className="relative group">
                <Lock className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors duration-200 ${
                  focusedField === 'password' ? 'text-green-400' : 'text-gray-400'
                }`} size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="w-full bg-white/10 backdrop-blur-sm text-white placeholder-gray-300 pl-12 pr-12 py-3 border border-white/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all duration-200"
                  placeholder="Entrez votre mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField('')}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-green-400 transition-colors duration-200"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full bg-gradient-to-r from-green-600 to-amber-500 text-white font-semibold py-3 rounded-2xl hover:from-green-500 hover:to-amber-400 transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-green-500/25"
            >
              <span className="flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Connexion...
                  </>
                ) : (
                  <>
                    Se connecter
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                  </>
                )}
              </span>
            </button>

            {/* Links */}
            <div className="text-center text-sm text-gray-300 space-y-2">
              <div>
                <span>Pas encore de compte ? </span>
                <Link href="/auth/register" className="text-transparent bg-gradient-to-r from-green-400 to-amber-400 bg-clip-text font-semibold hover:from-green-300 hover:to-amber-300 transition-all duration-200">
                  S'inscrire
                </Link>
              </div>
              <div>
                <span>Mot de passe oublié ? </span>
                <Link href="/auth/password/reset" className="text-transparent bg-gradient-to-r from-green-400 to-amber-400 bg-clip-text font-semibold hover:from-green-300 hover:to-amber-300 transition-all duration-200">
                  Réinitialiser
                </Link>
              </div>
            </div>
          </form>

          {/* Message */}
          {message && (
            <div className={`text-center text-sm px-4 py-3 rounded-xl border backdrop-blur-sm transition-all duration-300 ${
              message.includes('✅') 
                ? 'bg-green-500/20 border-green-500/30 text-green-300' 
                : 'bg-red-500/20 border-red-500/30 text-red-300'
            }`}>
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}