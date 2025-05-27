'use client'

import { useState } from 'react'
import { Mail, User, Lock, Eye, EyeOff, Sprout, ArrowRight, Leaf } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function RegisterForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
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

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/users/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, username, password }),
    })

    const data = await res.json()
    setLoading(false)

    if (res.status === 201) {
      setEmail('')
      setUsername('')
      setPassword('')
      router.push('/auth/check-email')
    } else {
      setMessage(`❌ Erreur: ${JSON.stringify(data)}`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#668f4f] via-[#7fa465] to-[#d4cc9a] flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 w-64 h-64 bg-[#7fa465]/20 rounded-full mix-blend-multiply filter blur-2xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-[#668f4f]/15 rounded-full mix-blend-multiply filter blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/3 right-1/4 w-48 h-48 bg-[#d4cc9a]/10 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-500"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.05)_1px,transparent_0)] bg-[size:40px_40px]"></div>
        <div className="absolute top-1/4 left-1/3 opacity-10">
          <Leaf className="w-32 h-32 text-[#7fa465] transform rotate-12 animate-pulse" />
        </div>
        <div className="absolute bottom-1/3 right-1/4 opacity-5">
          <Sprout className="w-24 h-24 text-[#668f4f] transform -rotate-12 animate-pulse delay-700" />
        </div>
      </div>

      <div className="relative w-full max-w-md">
        <div className="absolute inset-0 bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 transform rotate-1"></div>
        <div className="relative bg-white/5 backdrop-blur-sm rounded-3xl p-8 space-y-8 border border-white/10 shadow-2xl">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-[#7fa465] via-[#668f4f] to-[#f0d696] rounded-3xl mb-4 shadow-lg">
              <Sprout className="w-10 h-10 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-white via-[#f0d696] to-[#668f4f] bg-clip-text text-transparent mb-2">
                Créer un compte
              </h2>
              <p className="text-[#d4cc9a] text-sm">Rejoignez la révolution agricole numérique</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#d4cc9a]">Adresse email</label>
              <div className="relative group">
                <Mail className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-all duration-200 ${focusedField === 'email' ? 'text-[#7fa465] scale-110' : 'text-gray-400'}`} size={20} />
                <input
                  type="email"
                  className="w-full bg-white/10 backdrop-blur-sm text-white placeholder-gray-300 pl-12 pr-4 py-3 border border-white/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#7fa465]/50 focus:border-[#7fa465]/50 transition-all duration-200 hover:bg-white/15"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField('')}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#d4cc9a]">Nom d'utilisateur</label>
              <div className="relative group">
                <User className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-all duration-200 ${focusedField === 'username' ? 'text-[#7fa465] scale-110' : 'text-gray-400'}`} size={20} />
                <input
                  type="text"
                  className="w-full bg-white/10 backdrop-blur-sm text-white placeholder-gray-300 pl-12 pr-4 py-3 border border-white/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#7fa465]/50 focus:border-[#7fa465]/50 transition-all duration-200 hover:bg-white/15"
                  placeholder="Choisissez un nom d'utilisateur"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onFocus={() => setFocusedField('username')}
                  onBlur={() => setFocusedField('')}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#d4cc9a]">Mot de passe</label>
              <div className="relative group">
                <Lock className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-all duration-200 ${focusedField === 'password' ? 'text-[#7fa465] scale-110' : 'text-gray-400'}`} size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="w-full bg-white/10 backdrop-blur-sm text-white placeholder-gray-300 pl-12 pr-12 py-3 border border-white/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#7fa465]/50 focus:border-[#7fa465]/50 transition-all duration-200 hover:bg-white/15"
                  placeholder="Créez un mot de passe sécurisé"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField('')}
                  required
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#7fa465] transition-colors duration-200"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <div className="text-xs text-[#d4cc9a] space-y-1">
                <p>• Au moins 8 caractères</p>
                <p>• Mélange de lettres et chiffres recommandé</p>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full bg-gradient-to-r from-[#7fa465] via-[#668f4f] to-[#f0d696] text-white font-semibold py-4 rounded-2xl hover:from-[#7fa465] hover:via-[#668f4f] hover:to-[#f0d696] transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-[#7fa465]/25"
            >
              <span className="flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Création du compte...
                  </>
                ) : (
                  <>
                    <Sprout className="w-5 h-5 group-hover:rotate-12 transition-transform duration-200" />
                    S'inscrire
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                  </>
                )}
              </span>
            </button>

            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-sm text-[#d4cc9a]">
                <span>Vous avez déjà un compte ?</span>
                <Link href="/auth/login" className="text-transparent bg-gradient-to-r from-[#7fa465] to-[#668f4f] bg-clip-text font-semibold hover:from-[#a7c78e] hover:to-[#88a273] transition-all duration-200">
                  Se connecter
                </Link>
              </div>
            </div>

            <div className="text-center text-xs text-[#d4cc9a] leading-relaxed">
              En créant un compte, vous acceptez nos{' '}
              <Link href="/terms" className="text-[#7fa465] hover:text-[#668f4f] underline transition-colors">
                conditions d'utilisation
              </Link>{' '}
              et notre{' '}
              <Link href="/privacy" className="text-[#7fa465] hover:text-[#668f4f] underline transition-colors">
                politique de confidentialité
              </Link>
            </div>
          </form>

          {message && (
            <div className={`text-center text-sm px-4 py-3 rounded-xl border backdrop-blur-sm transition-all duration-300 animate-fade-in ${message.includes('✅') ? 'bg-[#7fa465]/20 border-[#7fa465]/30 text-[#7fa465]' : 'bg-red-500/20 border-red-500/30 text-red-300'}`}>
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}