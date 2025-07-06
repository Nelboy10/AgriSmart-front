'use client'
import { useState, Suspense, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { Sprout, Cloud, Users, Sun, Droplets, Wind, Bot } from 'lucide-react'
import { useTheme } from 'next-themes'
import AgriBotButton from '@/components/AgriBotButton'

const WeatherWidget = dynamic(() => import('../weather/WeatherWidget'), {
  ssr: false,
  loading: () => (
    <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 bg-gradient-to-br from-blue-50/80 to-indigo-50/80 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-2xl border border-blue-100/50 dark:border-blue-800/30">
      <div className="w-8 h-8 border-4 border-blue-200 dark:border-blue-700 border-t-blue-500 dark:border-t-blue-400 rounded-full animate-spin mb-3"></div>
      <p className="text-sm font-medium">Chargement météo...</p>
    </div>
  )
})

const CommunityFeed = dynamic(() => import('@/components/CommunityFeed'), {
  ssr: false,
  loading: () => (
    <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 bg-white/50 dark:bg-slate-800/50 rounded-2xl">
      <div className="w-8 h-8 border-4 border-emerald-200 dark:border-emerald-700 border-t-emerald-500 dark:border-t-emerald-400 rounded-full animate-spin mb-3"></div>
      <p className="text-sm font-medium">Chargement de la communauté...</p>
    </div>
  )
})

const ChatBox = dynamic(() => import('@/components/ChatBox'), {
  ssr: false,
  loading: () => <div className="text-center p-4">Chargement de AgriBot...</div>
});

export default function HomePage() {
  const { theme } = useTheme()
  const [showChat, setShowChat] = useState(false)
  const [isBotBlinking, setIsBotBlinking] = useState(false)

  // Animation de clignement du robot
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBotBlinking(true)
      setTimeout(() => setIsBotBlinking(false), 200)
    }, 5000)
    return () => clearInterval(blinkInterval)
  }, [])

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-green-50/20 to-blue-50/30 dark:from-slate-900 dark:via-emerald-900/10 dark:to-blue-900/10`}>
      <div className="container mx-auto px-4 sm:px-6 py-8 md:py-12 lg:py-16">
        {/* Colonnes flexibles avec gestion responsive */}
        <div className="flex flex-col lg:flex-row gap-6 xl:gap-8">
          {/* Colonne principale */}
          <div className="flex-1 lg:flex-[2] space-y-6 xl:space-y-8 min-w-0">
            {/* Section Communauté */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.6 }}
              className="bg-white dark:bg-slate-800 rounded-2xl xl:rounded-3xl shadow-md dark:shadow-none border border-slate-100 dark:border-slate-700 overflow-hidden min-w-0"
            >
              <div className="relative bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-600 p-6">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-lg sm:rounded-xl border border-white/30">
                    <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-white">Communauté AgriSmart</h2>
                    <p className="text-emerald-100/90 text-sm">Partagez, échangez et apprenez ensemble</p>
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-6 min-w-0">
                <CommunityFeed />
              </div>
            </motion.div>

            {/* Section Statistiques - Responsive */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 min-w-0"
            >
              {/* Stat 1 */}
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/30 rounded-xl p-4 sm:p-5 border border-emerald-100 dark:border-emerald-800/30 min-h-[120px]">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-900/40 rounded-lg">
                    <Sun className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-slate-800 dark:text-slate-200">Ensoleillement</h3>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-emerald-700 dark:text-emerald-400 mb-1">8.2h</p>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Moyenne journalière</p>
              </div>
              
              {/* Stat 2 */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl p-4 sm:p-5 border border-blue-100 dark:border-blue-800/30 min-h-[120px]">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                    <Droplets className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-slate-800 dark:text-slate-200">Précipitations</h3>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-blue-700 dark:text-blue-400 mb-1">24mm</p>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Ces 7 derniers jours</p>
              </div>
              
              {/* Stat 3 */}
              <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/30 rounded-xl p-4 sm:p-5 border border-amber-100 dark:border-amber-800/30 min-h-[120px]">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-amber-100 dark:bg-amber-900/40 rounded-lg">
                    <Wind className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-slate-800 dark:text-slate-200">Humidité</h3>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-amber-700 dark:text-amber-400 mb-1">68%</p>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Niveau actuel</p>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="flex-1 space-y-6 xl:space-y-8 min-w-0">
            {/* Widget Météo */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="sticky top-6 xl:top-8"
            >
              <div className="bg-white dark:bg-slate-800 rounded-2xl xl:rounded-3xl shadow-md dark:shadow-none border border-slate-100 dark:border-slate-700 overflow-hidden">
                <div className="relative bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 p-5 sm:p-6">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-white/20 rounded-lg border border-white/30">
                      <Cloud className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-white">Météo Agricole</h3>
                      <p className="text-blue-100/90 text-sm">Prévisions locales</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 sm:p-5 min-w-0">
                  <div className="min-h-[300px]">
                    <WeatherWidget />
                  </div>
                </div>
              </div>

              {/* Activité Récente */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-md dark:shadow-none border border-slate-100 dark:border-slate-700 p-5 sm:p-6 min-w-0"
              >
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                  Activité Récente
                </h3>
                <div className="space-y-3 sm:space-y-4 min-w-0">
                  {/* Activité 1 */}
                  <div className="flex justify-between items-center p-3 bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/30 rounded-lg border border-emerald-100 dark:border-emerald-800/30">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Utilisateurs actifs</span>
                    </div>
                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">247</span>
                  </div>
                  
                  {/* Activité 2 */}
                  <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-lg border border-blue-100 dark:border-blue-800/30">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Posts partagés</span>
                    </div>
                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">89</span>
                  </div>
                  
                  {/* Activité 3 */}
                  <div className="flex justify-between items-center p-3 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 rounded-lg border border-purple-100 dark:border-purple-800/30">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Nouvelles questions</span>
                    </div>
                    <span className="text-sm font-bold text-purple-600 dark:text-purple-400">32</span>
                  </div>
                  
                  {/* Activité 4 */}
                  <div className="flex justify-between items-center p-3 bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/30 rounded-lg border border-amber-100 dark:border-amber-800/30">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Conseils donnés</span>
                    </div>
                    <span className="text-sm font-bold text-amber-600 dark:text-amber-400">156</span>
                  </div>
                </div>
              </motion.div>

              {/* Bannière d'action */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-5 sm:p-6 text-white shadow-md overflow-hidden relative min-w-0"
              >
                <div className="relative z-10 flex flex-col justify-between h-full">
                  <div>
                    <h3 className="text-lg font-bold mb-2">Rejoignez la communauté</h3>
                    <p className="text-sm text-emerald-100/90">Connectez-vous avec d'agriculteurs locaux et partagez vos expériences.</p>
                  </div>
                  <button className="w-full bg-white text-emerald-700 hover:bg-white/90 transition-colors py-2 px-4 rounded-lg text-sm font-semibold shadow-sm mt-4">
                    S'inscrire maintenant
                  </button>
                </div>
                <div className="absolute -bottom-4 -right-4 opacity-20">
                  <Sprout className="w-24 h-24 text-white" />
                </div>
              </motion.div>

              <AgriBotButton />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}