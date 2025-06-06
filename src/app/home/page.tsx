'use client'
import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { motion } from 'framer-motion'
import { Sprout, Users, Cloud, Lightbulb, Sparkles } from 'lucide-react'

// Import dynamique pour SSR Next.js
const WeatherWidget = dynamic(() => import('../weather/WeatherWidget'), { ssr: false })
const CommunityFeed = dynamic(() => import('../community/CommunityFeed'), { ssr: false })
const UserShowcase = dynamic(() => import('../users/UserShowcase'), { ssr: false })

export default function HomePage() {
  const userLocation = undefined

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%224%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
        <div className="relative container mx-auto px-4 py-20">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="flex justify-center mb-6">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 shadow-xl">
                <Sprout className="w-12 h-12 text-white" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Bienvenue sur{' '}
              <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                AgriSmart !
              </span>
            </h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-xl md:text-2xl text-green-100 mb-8 max-w-3xl mx-auto leading-relaxed"
            >
              Plateforme connectée pour les agriculteurs du Bénin
            </motion.p>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="flex justify-center gap-2"
            >
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="w-3 h-3 bg-white/60 rounded-full animate-pulse"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </motion.div>
          </motion.div>
        </div>
        {/* Vagues décoratives */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,60 C300,120 900,0 1200,60 L1200,120 L0,120 Z" fill="rgb(240, 253, 244)" />
          </svg>
        </div>
      </div>

      {/* Contenu principal en colonne */}
      <div className="container mx-auto px-4 py-12 -mt-8 relative z-10 flex flex-col gap-10 max-w-3xl">
        {/* Météo */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="group"
        >
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl p-6 shadow-2xl border border-white/20 hover:shadow-3xl transition-all duration-300 group-hover:scale-[1.02]">
            <div className="flex items-center gap-3 mb-4">
              <Cloud className="w-8 h-8 text-white animate-bounce" />
              <h2 className="text-xl font-bold text-white">Météo Locale</h2>
            </div>
            <Suspense fallback={
              <div className="bg-white/20 rounded-xl p-6 animate-pulse">
                <div className="flex items-center justify-center space-x-2">
                  <Sparkles className="w-6 h-6 text-white animate-spin" />
                  <span className="text-white font-medium">Chargement météo...</span>
                </div>
              </div>
            }>
              <WeatherWidget userLocation={userLocation} />
            </Suspense>
          </div>
        </motion.div>

        {/* Communauté / Posts */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="group"
        >
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl p-6 shadow-2xl border border-white/20 hover:shadow-3xl transition-all duration-300 group-hover:scale-[1.02]">
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-8 h-8 text-white animate-pulse" />
              <h2 className="text-xl font-bold text-white">Communauté</h2>
            </div>
            <Suspense fallback={
              <div className="bg-white/20 rounded-xl p-6 animate-pulse">
                <div className="flex items-center justify-center space-x-2">
                  <Sparkles className="w-6 h-6 text-white animate-spin" />
                  <span className="text-white font-medium">Chargement de la communauté...</span>
                </div>
              </div>
            }>
              <CommunityFeed />
            </Suspense>
          </div>
        </motion.div>


        {/* Membres actifs */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="group"
        >
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl p-6 shadow-2xl border border-white/20 hover:shadow-3xl transition-all duration-300 group-hover:scale-[1.02]">
            <UserShowcase />
          </div>
        </motion.div>
      </div>
    </div>
  )
}