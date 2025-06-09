'use client'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { Sprout, Cloud, Users, TrendingUp, MapPin, Calendar } from 'lucide-react'

const WeatherWidget = dynamic(() => import('../weather/WeatherWidget'), {
  ssr: false,
  loading: () => (
    <div className="h-48 flex flex-col items-center justify-center text-slate-400 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
      <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mb-3"></div>
      <p className="text-sm font-medium">Chargement météo...</p>
    </div>
  )
})

const CommunityFeed = dynamic(() => import('@/components/CommunityFeed'), {
  ssr: false,
  loading: () => (
    <div className="h-64 flex flex-col items-center justify-center text-slate-400">
      <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin mb-3"></div>
      <p className="text-sm font-medium">Chargement de la communauté...</p>
    </div>
  )
})

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/30 to-blue-50/50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-700"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%224%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative container mx-auto px-6 py-20 text-center"
        >
          <motion.div
            animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.05, 1] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 4 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-sm rounded-2xl mb-8 shadow-lg"
          >
            <Sprout className="w-10 h-10 text-white" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight"
          >
            Agri<span className="text-emerald-200">Smart</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-xl md:text-2xl text-emerald-100 max-w-3xl mx-auto mb-8 leading-relaxed"
          >
            Solutions digitales innovantes pour l'agriculture béninoise moderne
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="flex flex-wrap justify-center gap-6 text-emerald-100"
          >
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              <span className="text-sm font-medium">Optimisation des rendements</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              <span className="text-sm font-medium">Données localisées</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              <span className="text-sm font-medium">Planification intelligente</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Vague de transition */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 320" className="w-full h-20 text-slate-50" preserveAspectRatio="none">
            <path
              fill="currentColor"
              d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,154.7C960,171,1056,181,1152,165.3C1248,149,1344,107,1392,85.3L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            ></path>
          </svg>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="container mx-auto px-6 py-16 -mt-16 relative z-10">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Colonne principale - Communauté */}
          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.6 }}
              className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 overflow-hidden"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-600"></div>
                <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2240%22%20height%3D%2240%22%20viewBox%3D%220%200%2040%2040%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.1%22%3E%3Cpath%20d%3D%22M20%2020c0-5.5-4.5-10-10-10s-10%204.5-10%2010%204.5%2010%2010%2010%2010-4.5%2010-10zm10%200c0-5.5-4.5-10-10-10s-10%204.5-10%2010%204.5%2010%2010%2010%2010-4.5%2010-10z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>

                <div className="relative p-8">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="flex items-center justify-center w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">Communauté AgriSmart</h2>
                      <p className="text-emerald-100">Partagez, échangez et apprenez ensemble</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 pt-0">
                <CommunityFeed />
              </div>
            </motion.div>
          </div>

          {/* Sidebar - Météo */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="sticky top-8"
            >
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 overflow-hidden">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600"></div>
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2230%22%20height%3D%2230%22%20viewBox%3D%220%200%2030%2030%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.1%22%3E%3Cpolygon%20points%3D%2215%2C0%2030%2C15%2015%2C30%200%2C15%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>

                  <div className="relative p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex items-center justify-center w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg">
                        <Cloud className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">Météo Agricole</h3>
                        <p className="text-blue-100 text-sm">Prévisions locales</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0">
                  <WeatherWidget />
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="mt-6 bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6"
              >
                <h3 className="text-lg font-bold text-slate-800 mb-4">Aperçu Aujourd'hui</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                      <span className="text-sm font-medium text-slate-700">Utilisateurs actifs</span>
                    </div>
                    <span className="text-sm font-bold text-emerald-600">247</span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm font-medium text-slate-700">Posts partagés</span>
                    </div>
                    <span className="text-sm font-bold text-blue-600">89</span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-100">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                      <span className="text-sm font-medium text-slate-700">Conseils donnés</span>
                    </div>
                    <span className="text-sm font-bold text-amber-600">156</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
