'use client'

import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { Sprout, Cloud, Users } from 'lucide-react'

const WeatherWidget = dynamic(() => import('../weather/WeatherWidget'), {
  ssr: false,
  loading: () => <div className="h-64 flex items-center justify-center text-gray-400">Chargement météo...</div>
})

const CommunityFeed = dynamic(() => import('@/components/CommunityFeed'), {
  ssr: false,
  loading: () => <div className="h-64 flex items-center justify-center text-gray-400">Chargement de la communauté...</div>
})



export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Hero */}
      <div className="relative bg-emerald-600">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="container mx-auto px-4 text-center"
        >
          <motion.div
            animate={{
              rotate: [0, 5, -5, 0],
              scale: [1, 1.05, 1]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3
            }}
            className="inline-block mb-6"
          >
            <Sprout className="w-12 h-12 text-white" />
          </motion.div>

          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            AgriSmart
          </h1>
          <p className="text-xl text-emerald-100 max-w-2xl mx-auto">
            Solutions digitales pour l'agriculture béninoise
          </p>
        </motion.div>

        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-green-50 to-transparent" />
      </div>

      {/* Contenu principal */}
      <div className="container mx-auto px-4 py-12 -mt-12 space-y-12">
        {/* Widget Météo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-md overflow-hidden"
        >
          <div className="p-6 bg-emerald-600 text-white flex items-center gap-3">
            <Cloud className="w-6 h-6" />
            <h2 className="text-xl font-semibold">Météo Agricole</h2>
          </div>
          <div className="p-6">
            <WeatherWidget />
          </div>
        </motion.div>

        {/* Communauté */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-2xl shadow-md overflow-hidden"
        >
          <div className="p-6 bg-emerald-600 text-white flex items-center gap-3">
            <Users className="w-6 h-6" />
            <h2 className="text-xl font-semibold">Communauté</h2>
          </div>
          <div className="p-6">
            <CommunityFeed />
          </div>
        </motion.div>

        {/* Utilisateurs */}
        
      </div>
    </div>
  )
}
