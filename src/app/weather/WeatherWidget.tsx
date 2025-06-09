'use client'

import { useEffect, useState } from 'react'
import { FaCloudSun, FaTemperatureHigh, FaWind, FaMapMarkerAlt, FaSearch } from 'react-icons/fa'

export default function WeatherWidget() {
  const [weather, setWeather] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [location, setLocation] = useState('')
  const [showInput, setShowInput] = useState(false)

  useEffect(() => {
    getUserCityAndFetchWeather()
  }, [])

  async function getUserCityAndFetchWeather() {
    setLoading(true)
    try {
      const pos = await getCurrentPosition()
      const city = await reverseGeocode(pos.coords.latitude, pos.coords.longitude)
      if (city) {
        setLocation(city)
        fetchWeather(city)
      } else {
        throw new Error("Ville non trouvée")
      }
    } catch (err) {
      setError("Impossible de récupérer votre localisation.")
      setShowInput(true)
    } finally {
      setLoading(false)
    }
  }

  function getCurrentPosition(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) return reject()
      navigator.geolocation.getCurrentPosition(resolve, reject)
    })
  }

  async function reverseGeocode(lat: number, lon: number): Promise<string | null> {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`)
    const data = await res.json()
    return data?.address?.city || data?.address?.town || data?.address?.village || null
  }

  function fetchWeather(city: string) {
    setLoading(true)
    setError('')
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/weather/live/?location=${encodeURIComponent(city)}`)
      .then(res => {
        if (!res.ok) throw new Error('Ville non trouvée')
        return res.json()
      })
      .then(data => setWeather(data))
      .catch(() => setError('Impossible de récupérer la météo pour cette ville.'))
      .finally(() => setLoading(false))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (location.trim()) {
      fetchWeather(location.trim())
      setShowInput(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-sm mx-auto flex flex-col items-center gap-4 transition-all">
      <div className="flex items-center gap-2 text-green-700 font-bold text-lg mb-2">
        <FaCloudSun className="text-2xl" />
        Météo
      </div>

      {showInput && (
        <form onSubmit={handleSubmit} className="flex w-full gap-2 mb-2">
          <input
            className="flex-1 px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-green-400 outline-none text-gray-700"
            placeholder="Entrez une ville (ex: Parakou)"
            value={location}
            onChange={e => setLocation(e.target.value)}
            autoFocus
          />
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-1 hover:bg-green-700 transition"
          >
            <FaSearch />
          </button>
        </form>
      )}

      {loading && <div className="text-gray-400 animate-pulse">Chargement météo...</div>}

      {error && (
        <div className="text-red-600 text-sm text-center">
          {error}
          <button
            className="block mt-2 text-green-600 underline"
            onClick={() => setShowInput(true)}
          >
            Réessayer
          </button>
        </div>
      )}

      {!loading && weather && (
        <div className="flex flex-col items-center gap-2 w-full">
          <div className="flex items-center gap-2 text-green-800 text-xl font-semibold">
            <FaMapMarkerAlt className="text-red-400" />
            {weather.location}
          </div>
          <div className="text-5xl font-bold flex items-center gap-2 text-emerald-600">
            <FaTemperatureHigh className="text-orange-400" />
            {weather.temperature}°C
          </div>
          <div className="flex gap-3 text-sm text-gray-500">
            <span><FaWind className="inline" /> {weather.windspeed ?? '-'} km/h</span>
            <span>{weather.condition}</span>
            <span>{weather.is_day ? 'Jour' : 'Nuit'}</span>
          </div>
          <div className="text-xs text-gray-400">{new Date(weather.date).toLocaleString()}</div>
          <button
            className="mt-2 text-green-600 underline text-xs"
            onClick={() => setShowInput(true)}
          >
            Changer de ville
          </button>
        </div>
      )}
    </div>
  )
}
