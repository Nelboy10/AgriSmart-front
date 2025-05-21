'use client'

import { useEffect, useState } from 'react'

interface WeatherData {
  id: number
  location: string
  temperature: number
  windspeed?: number
  winddirection?: number
  weathercode?: number
  is_day: boolean
  condition: string
  date: string
}

export default function HomePage() {
  const [weather, setWeather] = useState<WeatherData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [location, setLocation] = useState('')
  const [searching, setSearching] = useState(false)

  // Récupère la météo par défaut (toutes les villes)
  useEffect(() => {
    fetchWeather()
  }, [])

  const fetchWeather = async (loc?: string) => {
    setLoading(true)
    setError('')
    let url = `${process.env.NEXT_PUBLIC_API_URL}/api/weather/`
    if (loc) {
      url += `?location=${encodeURIComponent(loc)}`
    }
    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error('Erreur lors du chargement des données météo')
      const data = await res.json()
      // Si la recherche est pour une ville précise, assure-toi d'avoir un tableau
      setWeather(Array.isArray(data) ? data : [data])
    } catch (err: any) {
      setError(err.message)
      setWeather([])
    } finally {
      setLoading(false)
      setSearching(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearching(true)
    fetchWeather(location)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 to-white text-gray-600 flex flex-col items-center py-10 px-4">
      <h1 className="text-3xl font-bold text-green-700 mb-6 text-center">
        Bienvenue sur AgriSmart&nbsp;!
      </h1>
      <h2 className="text-xl text-gray-600 mb-4 text-center">
        Données météo pour les agriculteurs béninois
      </h2>
      <form onSubmit={handleSearch} className="flex gap-2 mb-6 w-full max-w-lg">
        <input
          type="text"
          placeholder="Rechercher une ville (ex: Cotonou, Parakou...)"
          className="flex-1 px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400"
          value={location}
          onChange={e => setLocation(e.target.value)}
        />
        <button
          type="submit"
          className="bg-green-600 text-white px-6 py-2 rounded-xl hover:bg-green-700 transition"
          disabled={searching}
        >
          {searching ? 'Recherche...' : 'Rechercher'}
        </button>
      </form>

      {loading && <div className="text-gray-500">Chargement des données météo...</div>}
      {error && <div className="text-red-600">{error}</div>}

      {!loading && !error && (
        <div className="w-full max-w-3xl bg-white shadow-xl rounded-2xl p-6 border border-gray-100">
          {weather.length === 0 ? (
            <div className="text-gray-600 text-center">Aucune donnée météo disponible.</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="py-2 px-3 border-b">Ville</th>
                  <th className="py-2 px-3 border-b">Température (°C)</th>
                  <th className="py-2 px-3 border-b">Vent (km/h)</th>
                  <th className="py-2 px-3 border-b">Direction du vent</th>
                  <th className="py-2 px-3 border-b">Condition</th>
                  <th className="py-2 px-3 border-b">Jour/Nuit</th>
                  <th className="py-2 px-3 border-b">Date</th>
                </tr>
              </thead>
              <tbody>
                {weather.map((item) => (
                  <tr key={item.id}>
                    <td className="py-2 px-3 border-b">{item.location}</td>
                    <td className="py-2 px-3 border-b">{item.temperature}</td>
                    <td className="py-2 px-3 border-b">{item.windspeed ?? '-'}</td>
                    <td className="py-2 px-3 border-b">{item.winddirection ?? '-'}</td>
                    <td className="py-2 px-3 border-b">{item.condition}</td>
                    <td className="py-2 px-3 border-b">{item.is_day ? 'Jour' : 'Nuit'}</td>
                    <td className="py-2 px-3 border-b">{new Date(item.date).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
}