'use client'
import WeatherWidget from './WeatherWidget'

// Récupère la localisation utilisateur via props, contexte, ou API utilisateur
export default function WeatherPage() {
  // Exemple : localisation récupérée depuis le profil utilisateur (adapter selon ton système)
  const userLocation = undefined // Remplace par la localisation du user si dispo

  return (
    <div className="min-h-screen flex justify-center items-start py-10 px-4 bg-gradient-to-br from-green-100 to-white">
      <WeatherWidget userLocation={userLocation} />
    </div>
  )
}