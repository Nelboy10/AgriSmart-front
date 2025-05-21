'use client'

import { useState } from 'react'
import { User, Lock } from 'lucide-react'
import Link from 'next/link'

export default function LoginForm() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/jwt/create/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })

      const data = await res.json()
      setLoading(false)

      if (res.ok) {
        setMessage('✅ Connexion réussie !')
        // Stocker le token dans localStorage ou cookie si nécessaire
        localStorage.setItem('access', data.access)
        localStorage.setItem('refresh', data.refresh)
      } else {
        setMessage(`❌ Erreur: ${JSON.stringify(data)}`)
      }
    } catch (error) {
      console.error(error)
      setMessage("❌ Une erreur est survenue.")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 to-white flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white shadow-2xl rounded-2xl p-8 space-y-6 border border-gray-100">
        <h2 className="text-3xl font-bold text-center text-green-700">Connexion Agrismart</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">Nom d'utilisateur</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                className="w-full text-gray-800 pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">Mot de passe</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="password"
                className="w-full text-gray-800 pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 text-white font-semibold py-2 rounded-xl hover:bg-green-700 transition duration-200"
            disabled={loading}
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
          <div className="text-center flex justify-center items-center gap-2 text-sm text-gray-600">
            <p>Mot de passe oublié ?</p>
            <Link href="/auth/password/reset" className='text-green-400 font-semibold hover:underline'>
              Réinitialiser
            </Link>
          </div>
          <div className="text-center flex justify-center items-center gap-2 text-sm text-gray-600">
            <p>Vous n'avez pas de compte ?</p>
            <Link href="/auth/register" className='text-green-400 font-semibold hover:underline'>
              S'inscrire
            </Link>
          </div>
        </form>

        {message && (
          <div className="text-center text-sm text-gray-700 mt-2">
            {message}
          </div>
        )}
      </div>
    </div>
  )
}
