'use client'
import { useEffect, useState } from 'react'

interface User {
  id: number
  username: string
  image?: string
  email?: string
}

export default function UserShowcase() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/`)
        
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des utilisateurs')
        }

        const data = await response.json()
        // Gère à la fois les réponses paginées et non-paginées
        setUsers(Array.isArray(data) ? data : (data.results || []))
        
      } catch (err) {
        console.error('Erreur API:', err)
        setError('Impossible de charger les utilisateurs')
        setUsers([])
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  // Affiche un message de chargement
  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow p-5 flex flex-col items-center w-full max-w-xl">
        <h2 className="text-lg font-bold text-green-700 mb-4">Chargement des membres...</h2>
        <div className="animate-pulse flex space-x-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-gray-200" />
              <div className="h-4 w-12 bg-gray-200 mt-2 rounded" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Affiche un message d'erreur
  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow p-5 flex flex-col items-center w-full max-w-xl">
        <h2 className="text-lg font-bold text-red-500 mb-2">Erreur</h2>
        <p className="text-gray-500 text-center">{error}</p>
      </div>
    )
  }

  // Affiche un message si aucun utilisateur
  if (users.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow p-5 flex flex-col items-center w-full max-w-xl">
        <h2 className="text-lg font-bold text-green-700 mb-2">Rejoignez notre communauté !</h2>
        <p className="text-gray-500 text-center">Soyez le premier à vous inscrire</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow p-5 flex flex-col items-center w-full max-w-xl">
      <h2 className="text-lg font-bold text-green-700 mb-2">Ils ont déjà rejoint AgriSmart</h2>
      
      <div className="flex flex-wrap gap-4 justify-center mb-4">
        {users.slice(0, 10).map(user => (
          <div key={user.id} className="flex flex-col items-center group">
            <div className="w-12 h-12 rounded-full bg-green-100 border-2 border-green-300 flex items-center justify-center overflow-hidden">
              {user.image ? (
                <img 
                  src={user.image} 
                  alt={user.username}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Si l'image ne se charge pas, affiche l'initiale
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                  }}
                />
              ) : null}
              <span className="text-green-700 font-bold text-lg">
                {user.username?.[0]?.toUpperCase()}
              </span>
            </div>
            <span className="text-xs text-gray-600 mt-1 group-hover:text-green-600 transition-colors">
              {user.username}
            </span>
          </div>
        ))}
      </div>
      
      <span className="text-sm text-gray-500">
        + {users.length} membre{users.length > 1 ? 's' : ''} actif{users.length > 1 ? 's' : ''}
      </span>
    </div>
  )
}