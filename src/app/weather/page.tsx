'use client'
import WeatherWidget from './WeatherWidget'

export default function WeatherPage() {
  return (
    <div className="min-h-screen flex justify-center items-start py-10 px-4 bg-gradient-to-br from-green-100 to-white">
      <WeatherWidget />
    </div>
  )
}
