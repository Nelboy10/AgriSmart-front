'use client'
import { useEffect, useState } from 'react'

export default function UserShowcase() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.resolve(
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/`)
        .then(res => res.json())
    )
      .then(data => setUsers(data))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="bg-white rounded-2xl shadow p-5 flex flex-col items-center w-full max-w-xl">
      <h2 className="text-lg font-bold text-green-700 mb-2">Ils ont déjà rejoint AgriSmart</h2>
      {loading ? (
        <div>Chargement...</div>
      ) : users.length === 0 ? (
        <div className="text-gray-400">Aucun utilisateur.</div>
      ) : (
        <div className="flex gap-4 mb-2 flex-wrap justify-center">
          {users.slice(0, 10).map(u => (
            <div key={u.id} className="flex flex-col items-center">
              <img src={u.avatar || '/avatar.png'} alt={u.username} className="w-12 h-12 rounded-full border-2 border-green-400" />
              <span className="text-xs">{u.username}</span>
            </div>
          ))}
        </div>
      )}
      <span className="text-gray-500 text-sm">+ {users.length} membres actifs</span>
    </div>
  )
}