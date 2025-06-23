'use client'

import { useState } from 'react'
import { User, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'

export default function LoginForm() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [focusedField, setFocusedField] = useState('')
  const { login } = useAuthStore()

  const getTranslatedErrorMessage = (error: unknown): string => {
    if (!(error instanceof Error)) return 'Une erreur inconnue est survenue';
    
    const errorMessage = error.message.toLowerCase();
    
    // Traduction des erreurs courantes de Django
    const errorTranslations: Record<string, string> = {
      'no active account found with the given credentials': 'Identifiants incorrects. Veuillez réessayer.',
      'unable to log in with provided credentials': 'Impossible de se connecter avec ces identifiants.',
      'this field may not be blank': 'Tous les champs sont obligatoires.',
      'invalid token': 'Session expirée. Veuillez vous reconnecter.',
      'token is invalid or expired': 'Session expirée. Veuillez vous reconnecter.',
      'user is not active': 'Ce compte est désactivé. Veuillez contacter un administrateur.',
      'too many login attempts': 'Trop de tentatives de connexion. Veuillez réessayer plus tard.'
    };

    // Cherche une correspondance dans les traductions
    const translatedError = Object.entries(errorTranslations).find(([key]) => 
      errorMessage.includes(key.toLowerCase())
    );

    return translatedError 
      ? `❌ ${translatedError[1]}` 
      : `❌ Erreur de connexion: ${errorMessage}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    
    try {
      // Utilisation de la méthode login du store
      await login({ username, password })
      // La redirection est gérée par le composant parent ou le layout
      // après une authentification réussie
      window.location.href = '/home'
    } catch (error) {
      setMessage(getTranslatedErrorMessage(error));
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2e7d32] via-[#8d6e63] to-[#2e7d32] flex items-center justify-center px-4 relative overflow-hidden pt-30 pb-20 overflow-x-hidden">
      
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

            <div className="flex flex-col items-center justify-between gap-4">
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex items-center justify-center px-6 py-3 rounded-2xl font-medium transition-all duration-200 ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-600 to-amber-500 hover:from-green-700 hover:to-amber-600 transform hover:-translate-y-0.5 shadow-lg'
                }`}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Connexion en cours...
                  </span>
                ) : (
                  <span className="flex items-center">
                    Se connecter
                    <ArrowRight className="ml-2" size={18} />
                  </span>
                )}
              </button>

              <p className="text-sm text-gray-300 text-center">
                Pas encore de compte ?{' '}
                <Link href="/auth/register" className="text-green-300 hover:text-green-200 font-medium transition-colors">
                  S'inscrire
                </Link>
              </p>
              
              <Link 
                href="/forgot-password" 
                className="text-sm text-amber-300 hover:text-amber-200 transition-colors"
              >
                Mot de passe oublié ?
              </Link>
            </div>

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
          </form>
        </div>
      </div>
    </div>
  )
}