'use client'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { Sprout, Cloud, Users, Sun, Droplets, Wind } from 'lucide-react'
import { useTheme } from 'next-themes'

const WeatherWidget = dynamic(() => import('../weather/WeatherWidget'), {
  ssr: false,
  loading: () => (
    <div className="h-64 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 bg-gradient-to-br from-blue-50/80 to-indigo-50/80 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-2xl border border-blue-100/50 dark:border-blue-800/30">
      <div className="w-8 h-8 border-4 border-blue-200 dark:border-blue-700 border-t-blue-500 dark:border-t-blue-400 rounded-full animate-spin mb-3"></div>
      <p className="text-sm font-medium">Chargement météo...</p>
    </div>
  )
})

const CommunityFeed = dynamic(() => import('@/components/CommunityFeed'), {
  ssr: false,
  loading: () => (
    <div className="h-64 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 bg-white/50 dark:bg-slate-800/50 rounded-2xl">
      <div className="w-8 h-8 border-4 border-emerald-200 dark:border-emerald-700 border-t-emerald-500 dark:border-t-emerald-400 rounded-full animate-spin mb-3"></div>
      <p className="text-sm font-medium">Chargement de la communauté...</p>
    </div>
  )
})

export default function HomePage() {
  const { theme } = useTheme()

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-green-50/20 to-blue-50/30 dark:from-slate-900 dark:via-emerald-900/10 dark:to-blue-900/10`}>
      {/* Contenu principal */}
      <div className="container mx-auto px-4 sm:px-6 py-8 md:py-12 lg:py-16">
        <div className="grid lg:grid-cols-4 gap-6 xl:gap-8">
          {/* Colonne principale - Communauté */}
          <div className="lg:col-span-3 space-y-6 xl:space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.6 }}
              className="bg-white dark:bg-slate-800 rounded-2xl xl:rounded-3xl shadow-md dark:shadow-none border border-slate-100 dark:border-slate-700 overflow-hidden"
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

              <div className="p-4 sm:p-6">
                <CommunityFeed />
              </div>
            </motion.div>

            {/* Section Statistiques */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
            >
              {[
                { icon: <Sun className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />, title: "Ensoleillement", value: "8.2h", description: "Moyenne journalière", color: "emerald" },
                { icon: <Droplets className="w-5 h-5 text-blue-600 dark:text-blue-400" />, title: "Précipitations", value: "24mm", description: "Ces 7 derniers jours", color: "blue" },
                { icon: <Wind className="w-5 h-5 text-amber-600 dark:text-amber-400" />, title: "Humidité", value: "68%", description: "Niveau actuel", color: "amber" }
              ].map((item, index) => (
                <div 
                  key={index}
                  className={`bg-gradient-to-br from-${item.color}-50 to-${item.color}-100 dark:from-${item.color}-900/30 dark:to-${item.color}-800/30 rounded-xl p-4 sm:p-5 border border-${item.color}-100 dark:border-${item.color}-800/30`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 bg-${item.color}-100 dark:bg-${item.color}-900/40 rounded-lg`}>
                      {item.icon}
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-slate-800 dark:text-slate-200">{item.title}</h3>
                  </div>
                  <p className={`text-2xl sm:text-3xl font-bold text-${item.color}-700 dark:text-${item.color}-400 mb-1`}>{item.value}</p>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">{item.description}</p>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Sidebar - Météo et Statistiques */}
          <div className="lg:col-span-1 space-y-6 xl:space-y-8">
            {/* Widget Météo - Version élargie */}
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

                <div className="p-4 sm:p-5">
                  <div className="min-h-[280px] sm:min-h-[320px]">
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
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-md dark:shadow-none border border-slate-100 dark:border-slate-700 p-5 sm:p-6"
              >
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                  Activité Récente
                </h3>
                <div className="space-y-3 sm:space-y-4">
                  {[
                    { color: "emerald", text: "Utilisateurs actifs", value: "247" },
                    { color: "blue", text: "Posts partagés", value: "89" },
                    { color: "purple", text: "Nouvelles questions", value: "32" },
                    { color: "amber", text: "Conseils donnés", value: "156" }
                  ].map((item, index) => (
                    <div 
                      key={index}
                      className={`flex justify-between items-center p-3 bg-gradient-to-r from-${item.color}-50 to-${item.color}-100 dark:from-${item.color}-900/30 dark:to-${item.color}-800/30 rounded-lg border border-${item.color}-100 dark:border-${item.color}-800/30`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 bg-${item.color}-500 rounded-full animate-pulse`}></div>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{item.text}</span>
                      </div>
                      <span className={`text-sm font-bold text-${item.color}-600 dark:text-${item.color}-400`}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Bannière d'action */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-5 sm:p-6 text-white shadow-md overflow-hidden relative"
              >
                <div className="relative z-10">
                  <h3 className="text-lg font-bold mb-2">Rejoignez la communauté</h3>
                  <p className="text-sm text-emerald-100/90 mb-4">Connectez-vous avec d'agriculteurs locaux et partagez vos expériences.</p>
                  <button className="w-full bg-white text-emerald-700 hover:bg-white/90 transition-colors py-2 px-4 rounded-lg text-sm font-semibold shadow-sm">
                    S'inscrire maintenant
                  </button>
                </div>
                <div className="absolute -bottom-4 -right-4 opacity-20">
                  <Sprout className="w-24 h-24 text-white" />
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}