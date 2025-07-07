'use client'

import { useState } from 'react'
import { Mail, User, Lock, Eye, EyeOff, Sprout, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import AgriBotButton from '@/components/AgriBotButton'

export default function RegisterForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('')
  const [localisation, setLocalisation] = useState('')
  const [justificatif, setJustificatif] = useState<File | null>(null)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [focusedField, setFocusedField] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
  
    let formData = new FormData();
    formData.append('email', email);
    formData.append('username', username);
    formData.append('password', password);
    formData.append('role', role);
    formData.append('localisation', localisation);
    
    // Ajoutez le justificatif uniquement s'il est présent
    if (role === 'expert' && justificatif) {
      formData.append('justificatif', justificatif);
    }
  
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register/`, {
        method: 'POST',
        // Ne pas définir manuellement le Content-Type pour FormData
        // Le navigateur définira automatiquement le bon Content-Type avec la limite
        body: formData,
      });
  
      const data = await res.json();
  
      if (res.status === 201) {
        setEmail('');
        setUsername('');
        setPassword('');
        setRole('');
        setLocalisation('');
        setJustificatif(null);
        router.push('/auth/check-email');
      } else {
        setMessage(`❌ Erreur: ${data.detail || JSON.stringify(data)}`);
      }
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      setMessage('❌ Une erreur est survenue lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2e7d32] via-[#8d6e63] to-[#2e7d32] flex items-center justify-center px-4 relative overflow-hidden pt-30 pb-20 overflow-x-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-4 -left-4 w-72 h-72 bg-green-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-8 -right-4 w-72 h-72 bg-amber-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-lime-200 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse delay-500"></div>
      </div>

      <div className="relative w-full max-w-md">
        <div className="absolute inset-0 bg-[rgba(245,245,220,0.1)] backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20"></div>
        <div className="relative bg-white/5 backdrop-blur-sm rounded-3xl p-8 space-y-8 border border-white/10 shadow-2xl">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-600 to-amber-500 rounded-2xl mb-4">
              <Sprout className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-white via-lime-100 to-amber-100 bg-clip-text text-transparent">
              Créer un compte
            </h2>
            <p className="text-gray-200 text-sm">Rejoignez la révolution agricole numérique</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-200">Adresse email</label>
              <div className="relative group">
                <Mail className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors duration-200 ${focusedField === 'email' ? 'text-green-400' : 'text-gray-400'}`} size={20} />
                <input
                  type="email"
                  className="w-full bg-white/10 backdrop-blur-sm text-white placeholder-gray-300 pl-12 pr-4 py-3 border border-white/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all duration-200"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField('')}
                  required
                />
              </div>
            </div>

            {/* Username */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-200">Nom d'utilisateur</label>
              <div className="relative group">
                <User className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors duration-200 ${focusedField === 'username' ? 'text-green-400' : 'text-gray-400'}`} size={20} />
                <input
                  type="text"
                  className="w-full bg-white/10 backdrop-blur-sm text-white placeholder-gray-300 pl-12 pr-4 py-3 border border-white/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all duration-200"
                  placeholder="Choisissez un nom d'utilisateur"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onFocus={() => setFocusedField('username')}
                  onBlur={() => setFocusedField('')}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-200">Mot de passe</label>
              <div className="relative group">
                <Lock className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors duration-200 ${focusedField === 'password' ? 'text-green-400' : 'text-gray-400'}`} size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="w-full bg-white/10 backdrop-blur-sm text-white placeholder-gray-300 pl-12 pr-12 py-3 border border-white/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all duration-200"
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
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-green-400 transition-colors duration-200"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <div className="text-xs text-gray-200 space-y-1">
                <p>• Au moins 8 caractères</p>
                <p>• Mélange de lettres et chiffres recommandé</p>
              </div>
            </div>

            {/* Role */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-200">Rôle</label>
              <select
                className="w-full bg-white/10 backdrop-blur-sm text-white pl-4 pr-4 py-3 border border-white/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50"
                value={role}
                onChange={e => setRole(e.target.value)}
                required
              >
                <option value="" className='text-white bg-green-500'>Choisissez un rôle</option>
                <option value="farmer" className='text-white bg-green-500'>Agriculteur</option>
                <option value="client" className='text-white bg-green-500'>Client</option>
                <option value="expert" className='text-white bg-green-500'>Expert</option>
              </select>
            </div>

            {/* Localisation */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-200">Localisation</label>
              <input
                type="text"
                className="w-full bg-white/10 backdrop-blur-sm text-white pl-4 pr-4 py-3 border border-white/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50"
                placeholder="Votre ville ou région"
                value={localisation}
                onChange={e => setLocalisation(e.target.value)}
                required
              />
            </div>

            {/* Justificatif */}
            {role === 'expert' && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-white bg-green-500 rounded-2xl p-2">Justificatif (obligatoire pour les experts)</label>
                <input
                  type="file"
                  accept="application/pdf,image/*"
                  className="w-full bg-white/10 backdrop-blur-sm text-white pl-4 pr-4 py-3 border border-white/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50"
                  onChange={e => setJustificatif(e.target.files?.[0] || null)}
                  required={role === 'expert'}
                />
              </div>
            )}

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

            {/* Links */}
            <div className="text-center text-sm text-gray-300 space-y-2">
              <div>
                <span>Vous avez déjà un compte ? </span>
                <Link href="/auth/login" className="text-transparent bg-gradient-to-r from-green-400 to-amber-400 bg-clip-text font-semibold hover:from-green-300 hover:to-amber-300 transition-all duration-200">
                  Se connecter
                </Link>
              </div>
            </div>

            <div className="text-center text-xs text-gray-300 leading-relaxed">
              En créant un compte, vous acceptez nos{' '}
              <Link href="/terms" className="text-green-400 hover:text-amber-500 underline transition-colors">
                conditions d'utilisation
              </Link>{' '}
              et notre{' '}
              <Link href="/privacy" className="text-green-400 hover:text-amber-500 underline transition-colors">
                politique de confidentialité
              </Link>
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
      <AgriBotButton />
    </div>
  )
}