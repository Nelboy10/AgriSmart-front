'use client'

import { useEffect, useState } from 'react'
import { 
  CloudSun, 
  Thermometer, 
  Wind, 
  MapPin, 
  Search,
  Droplets,
  Sun,
  Moon
} from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'
import axios from 'axios';

interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  windspeed: number;
  humidity: number;
  precipitation: number;
  is_day: boolean;
  date: string;
}

export default function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [location, setLocation] = useState('')
  const [showInput, setShowInput] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const { user,token } = useAuthStore()

  useEffect(() => {
    // Vérifier le mode sombre sauvegardé
    const savedMode = localStorage.getItem('darkMode')
    if (savedMode) {
      setIsDarkMode(JSON.parse(savedMode))
    }
    
    // Utiliser la localisation de l'utilisateur si disponible
    if (user?.localisation) {
      setLocation(user.localisation)
      fetchWeather(user.localisation)
    } else {
      getUserCityAndFetchWeather()
    }
  }, [user])

  useEffect(() => {
    // Sauvegarder la préférence de mode
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode))
  }, [isDarkMode])

  async function getUserCityAndFetchWeather() {
    setLoading(true)
    try {
      const pos = await getCurrentPosition()
      const city = await reverseGeocode(pos.coords.latitude, pos.coords.longitude)
      if (city) {
        setLocation(city)
        await fetchWeather(city)
      } else {
        throw new Error("Ville non trouvée")
      }
    } catch (err) {
      setError("Impossible de détecter votre position. Recherchez une ville manuellement.")
      setShowInput(true)
    } finally {
      setLoading(false)
    }
  }

  function getCurrentPosition(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) return reject(new Error('Geolocation non supportée'))
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        timeout: 5000,
        maximumAge: 60000
      })
    })
  }

  async function reverseGeocode(lat: number, lon: number): Promise<string | null> {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`
      )
      const data = await res.json()
      return data?.address?.city || data?.address?.town || data?.address?.village || null
    } catch (err) {
      console.error("Erreur de géocodage inverse:", err)
      return null
    }
  }

  async function fetchWeather(city: string) {
    setLoading(true)
    setError('')
    try {
      if (!token) throw new Error('Non authentifié')

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/live_weather/?location=${encodeURIComponent(city)}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        }
      )

      // Pas besoin de vérifier response.data.ok avec Axios
      // car les erreurs HTTP sont gérées dans le catch
      const data = response.data
      
      // Formatage des données pour correspondre à l'interface WeatherData
      const weatherData: WeatherData = {
        location: data.location || city,
        temperature: Math.round(data.temperature || 0),
        condition: data.condition || 'Inconnu',
        windspeed: data.wind_speed || data.windspeed || 0,
        humidity: data.humidity || 0,
        precipitation: data.precipitation || 0,
        is_day: data.is_day || false,
        date: data.date || new Date().toISOString()
      }
      
      setWeather(weatherData)
      setLocation(weatherData.location)
    } catch (err) {
      console.error('Erreur fetchWeather:', err)
      if (axios.isAxiosError(err)) {
        // Gestion des erreurs spécifiques à Axios
        const errorMessage = err.response?.data?.detail || err.message
        setError(`Erreur: ${errorMessage}`)
      } else {
        setError('Impossible de récupérer la météo pour cette ville.')
      }
      setShowInput(true)
    } finally {
      setLoading(false)
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (location.trim()) {
      fetchWeather(location.trim())
      setShowInput(false)
    }
  }

  const getWeatherIcon = (condition: string) => {
    const conditions = condition.toLowerCase()
    if (conditions.includes('pluie')) return '🌧️'
    if (conditions.includes('nuage')) return '☁️'
    if (conditions.includes('soleil')) return '☀️'
    if (conditions.includes('orage')) return '⛈️'
    if (conditions.includes('neige')) return '❄️'
    return '🌤️'
  }

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
  }

  const themeClasses = {
    container: isDarkMode 
      ? 'bg-gray-800/95 backdrop-blur-sm border-gray-700/50 text-white' 
      : 'bg-white/90 backdrop-blur-sm border-white/70 text-gray-900',
    header: isDarkMode ? 'text-green-400' : 'text-green-700',
    button: isDarkMode 
      ? 'text-green-400 hover:text-green-300' 
      : 'text-green-600 hover:text-green-800',
    input: isDarkMode 
      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-green-400' 
      : 'bg-white border-gray-200 text-gray-700 placeholder-gray-500 focus:ring-green-400',
    searchButton: isDarkMode 
      ? 'bg-green-600 hover:bg-green-700' 
      : 'bg-green-600 hover:bg-green-700',
    locationText: isDarkMode ? 'text-green-300' : 'text-green-800',
    dateText: isDarkMode ? 'text-gray-400' : 'text-gray-500',
    temperature: isDarkMode ? 'text-emerald-400' : 'text-emerald-600',
    conditionText: isDarkMode ? 'text-gray-300' : 'text-gray-500',
    statCards: {
      wind: isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50/50 text-blue-600',
      humidity: isDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-50/50 text-green-600',
      rain: isDarkMode ? 'bg-amber-900/30 text-amber-400' : 'bg-amber-50/50 text-amber-600'
    },
    statLabel: isDarkMode ? 'text-gray-400' : 'text-gray-500',
    spinner: isDarkMode ? 'border-green-300 border-t-green-500' : 'border-green-200 border-t-green-500',
    loadingText: isDarkMode ? 'text-gray-400' : 'text-gray-500',
    errorText: isDarkMode ? 'text-red-400' : 'text-red-500',
    tryAgainButton: isDarkMode ? 'text-green-400 hover:text-green-300' : 'text-green-600 hover:text-green-800'
  }

  return (
    <div className={`${themeClasses.container} rounded-2xl shadow-lg p-6 w-full max-w-sm mx-auto flex flex-col gap-4 border transition-all duration-300`}>
      <div className="flex items-center justify-between">
        <div className={`flex items-center gap-2 ${themeClasses.header} font-bold text-lg`}>
          <CloudSun className="text-xl" />
          <span>Votre Météo</span>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={toggleDarkMode}
            className={`${themeClasses.button} transition-colors p-2 rounded-full`}
            aria-label="Basculer le mode sombre"
          >
            {isDarkMode ? <Sun className="text-sm" /> : <Moon className="text-sm" />}
          </button>
          
          <button
            onClick={() => setShowInput(!showInput)}
            className={`${themeClasses.button} transition-colors p-2 rounded-full`}
            aria-label="Changer de ville"
          >
            <MapPin className="text-sm" />
          </button>
        </div>
      </div>

      {showInput && (
        <div className="flex w-full gap-2">
          <input
            className={`flex-1 px-3 py-2 rounded-lg border ${themeClasses.input} focus:ring-2 outline-none text-sm transition-colors`}
            placeholder="Rechercher une ville..."
            value={location}
            onChange={e => setLocation(e.target.value)}
            autoFocus
            onKeyDown={e => e.key === 'Enter' && handleSubmit(e)}
          />
          <button
            onClick={handleSubmit}
            className={`${themeClasses.searchButton} text-white px-3 py-2 rounded-lg flex items-center gap-1 transition text-sm`}
          >
            <Search className="w-4 h-4" />
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-8 gap-2">
          <div className={`w-8 h-8 border-4 ${themeClasses.spinner} rounded-full animate-spin`}></div>
          <span className={`${themeClasses.loadingText} text-sm`}>Chargement des données météo...</span>
        </div>
      ) : error ? (
        <div className="text-center py-4">
          <div className={`${themeClasses.errorText} text-sm mb-2`}>{error}</div>
          <button
            className={`${themeClasses.tryAgainButton} text-sm font-medium transition-colors`}
            onClick={() => setShowInput(true)}
          >
            Essayer une autre ville
          </button>
        </div>
      ) : weather ? (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className={`flex items-center gap-2 ${themeClasses.locationText} text-lg font-semibold`}>
              <MapPin className="text-red-400 text-sm" />
              <span>{weather.location}</span>
            </div>
            <span className={`text-xs ${themeClasses.dateText}`}>
              {new Date(weather.date).toLocaleDateString('fr-FR', {
                weekday: 'short',
                day: 'numeric',
                month: 'short'
              })}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-end gap-2">
              <span className={`text-4xl font-bold ${themeClasses.temperature}`}>
                {Math.round(weather.temperature)}°C
              </span>
              <span className="text-4xl mb-1">
                {getWeatherIcon(weather.condition)}
              </span>
            </div>
            <div className={`text-sm ${themeClasses.conditionText} text-right`}>
              <div className="flex items-center gap-1">
                {weather.is_day ? (
                  <Sun className="text-yellow-400 w-4 h-4" />
                ) : (
                  <Moon className="text-blue-400 w-4 h-4" />
                )}
                <span>{weather.is_day ? 'Jour' : 'Nuit'}</span>
              </div>
              <div>{weather.condition}</div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center text-xs mt-2">
            <div className={`${themeClasses.statCards.wind} p-2 rounded-lg transition-colors`}>
              <div className="flex items-center justify-center gap-1">
                <Wind className="w-4 h-4" />
                <span>{weather.windspeed ?? '-'} km/h</span>
              </div>
              <div className={themeClasses.statLabel}>Vent</div>
            </div>
            <div className={`${themeClasses.statCards.humidity} p-2 rounded-lg transition-colors`}>
              <div className="flex items-center justify-center gap-1">
                <Droplets className="w-4 h-4" />
                <span>{weather.humidity ?? '-'}%</span>
              </div>
              <div className={themeClasses.statLabel}>Humidité</div>
            </div>
            <div className={`${themeClasses.statCards.rain} p-2 rounded-lg transition-colors`}>
              <div className="flex items-center justify-center gap-1">
                <Droplets className="w-4 h-4" />
                <span>{weather.precipitation ?? '-'} mm</span>
              </div>
              <div className={themeClasses.statLabel}>Pluie</div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}