'use client';
import { useState, useEffect } from 'react';
import { MessageCircle, Users, Search, Bell, Settings, Hash, TrendingUp, Menu, X, ChevronDown, LogOut } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import dynamic from 'next/dynamic';
import Image from 'next/image';

// Chargement dynamique des composants avec gestion du dark mode
const ForumView = dynamic(() => import('@/components/community/ForumView'), {
  loading: () => <LoadingView />,
  ssr: false
});

const ChatView = dynamic(() => import('@/components/community/ChatView'), {
  loading: () => <LoadingView />,
  ssr: false
});

const StatsView = dynamic(() => import('@/components/community/StatsView'), {
  loading: () => <LoadingView />,
  ssr: false
});

const LoadingView = () => (
  <div className="flex-1 flex items-center justify-center bg-background">
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
        <div className="absolute inset-0 rounded-full border-2 border-emerald-500/20"></div>
      </div>
      <p className="text-sm text-muted-foreground animate-pulse">Chargement...</p>
    </div>
  </div>
);

const ErrorView = ({ error, retry }: { error: Error; retry: () => void }) => (
  <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-background text-foreground">
    <div className="relative mb-6">
      <div className="bg-gradient-to-br from-red-500/20 to-red-600/20 p-6 rounded-2xl backdrop-blur-sm">
        <X className="text-red-500" size={32} />
      </div>
      <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-ping"></div>
    </div>
    <h2 className="text-2xl font-bold mb-3 text-foreground">Oops! Une erreur s'est produite</h2>
    <p className="text-muted-foreground mb-8 max-w-md leading-relaxed">{error.message}</p>
    <button
      onClick={retry}
      className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-emerald-500/25 font-medium"
    >
      Réessayer
    </button>
  </div>
);

export default function CommunityPage() {
  const { user, token, error: authError } = useAuthStore();
  const [activeView, setActiveView] = useState('forum');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewError, setViewError] = useState(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const navigation = [
    {
      id: 'forum',
      label: 'Forum',
      icon: Hash,
      component: ForumView,
      badge: '12',
      description: 'Discussions et questions'
    },
    {
      id: 'chat',
      label: 'Messages',
      icon: MessageCircle,
      component: ChatView,
      badge: "12",
      description: 'Messages privés'
    },
    {
      id: 'stats',
      label: 'Statistiques',
      icon: TrendingUp,
      component: StatsView,
      description: 'Analyses et données'
    },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuOpen && event.target instanceof Node) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [userMenuOpen]);

  const handleViewChange = (viewId: string) => {
    setViewError(null);
    setActiveView(viewId);
    setSidebarOpen(false);
  };

  const retryView = () => {
    setViewError(null);
    const current = activeView;
    setActiveView('forum');
    setTimeout(() => setActiveView(current), 10);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  if (!token) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-gray-950 dark:to-gray-900">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-t-3 border-b-3 border-emerald-500"></div>
            <div className="absolute inset-0 rounded-full border-3 border-emerald-500/20"></div>
          </div>
          <p className="text-lg font-medium text-emerald-700 dark:text-emerald-400">Connexion en cours...</p>
        </div>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="h-screen flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-red-50 to-red-100 dark:from-gray-950 dark:to-gray-900">
        <div className="relative mb-8">
          <div className="bg-gradient-to-br from-red-500/20 to-red-600/20 p-8 rounded-3xl backdrop-blur-sm border border-red-200/50 dark:border-red-800/50">
            <X className="text-red-500" size={48} />
          </div>
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full animate-ping"></div>
        </div>
        <h2 className="text-3xl font-bold mb-4 text-red-800 dark:text-red-200">Erreur d'authentification</h2>
        <p className="text-red-600 dark:text-red-400 mb-8 max-w-md leading-relaxed">{authError}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-red-500/25 font-medium"
        >
          Recharger la page
        </button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-gray-950 dark:to-gray-900">
        <div className="relative mb-8">
          <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 p-8 rounded-3xl backdrop-blur-sm border border-yellow-200/50 dark:border-yellow-800/50">
            <Users className="text-yellow-500" size={48} />
          </div>
        </div>
        <h2 className="text-3xl font-bold mb-4 text-yellow-800 dark:text-yellow-200">Connexion requise</h2>
        <p className="text-yellow-600 dark:text-yellow-400 mb-8 max-w-md leading-relaxed">
          Rejoignez notre communauté agricole pour accéder aux discussions et partager vos expériences
        </p>
        <button
          onClick={() => window.location.href = '/login'}
          className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-emerald-500/25 font-medium"
        >
          Se connecter
        </button>
      </div>
    );
  }

  const CurrentView = navigation.find(nav => nav.id === activeView)?.component;

  return (
    <div className="h-screen flex bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-40 lg:hidden transition-opacity duration-300"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl
        border-r border-gray-200 dark:border-gray-800 flex flex-col transition-all duration-300 ease-in-out
        shadow-2xl
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        w-80
      `}>
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-emerald-500/10 via-emerald-400/5 to-emerald-600/10">
          <div className="flex items-center justify-between">
            <div className="transition-all duration-300">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent">
                AgriSmart
              </h1>
              <p className="text-sm text-emerald-500/80 font-medium">Communauté Agricole</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleSidebar}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
              >
                <X size={20} className="text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="relative group">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all duration-200 placeholder-gray-400"
            />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navigation.map((item) => (
            <button
              key={item.id}
              onClick={() => handleViewChange(item.id)}
              className={`
                w-full flex items-center rounded-xl font-medium transition-all duration-200
                group relative overflow-hidden px-4 py-3.5
                ${activeView === item.id
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/25 scale-[1.02]'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
                }
              `}
            >
              <div className="flex items-center space-x-3">
                <item.icon size={20} className="flex-shrink-0" />
                <div>
                  <div className="flex items-center justify-between w-full">
                    <span className="text-left">{item.label}</span>
                    {item.badge && activeView !== item.id && (
                      <span className="ml-2 px-2 py-1 text-xs bg-emerald-500 text-white rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-left opacity-70 mt-0.5">{item.description}</p>
                </div>
              </div>
              {activeView === item.id && (
                <div className="absolute right-3 w-2 h-2 bg-white rounded-full animate-pulse" />
              )}
            </button>
          ))}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gradient-to-r from-gray-50/50 to-gray-100/50 dark:from-gray-800/50 dark:to-gray-900/50">
          <div className="user-menu relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="w-full flex items-center rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 cursor-pointer group p-3"
            >
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg flex-shrink-0">
                  {user.photo ?
                    <img src={user.photo} alt="Profile" className="w-full h-full rounded-full object-cover" />
                    : user.username.charAt(0).toUpperCase()
                  }
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">@{user?.username}</p>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">En ligne</p>
                      </div>
                    </div>
                    <ChevronDown
                      size={16}
                      className={`text-gray-400 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`}
                    />
                  </div>
                </div>
              </div>
            </button>

            {/* User Menu Dropdown */}
            {userMenuOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 transition-all duration-200">
                <button className="w-full flex items-center space-x-3 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <Settings size={16} />
                  <span>Paramètres</span>
                </button>
                <button className="w-full flex items-center space-x-3 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <Bell size={16} />
                  <span>Notifications</span>
                </button>
                <hr className="my-2 border-gray-200 dark:border-gray-700" />
                <button className="w-full flex items-center space-x-3 px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                  <LogOut size={16} />
                  <span>Déconnexion</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 p-4 flex items-center justify-between">
          <button
            onClick={toggleSidebar}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
          >
            <Menu size={24} className="text-gray-900 dark:text-gray-100" />
          </button>
          <div className="text-center">
            <h1 className="font-bold text-gray-900 dark:text-gray-100">
              {navigation.find(nav => nav.id === activeView)?.label}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {navigation.find(nav => nav.id === activeView)?.description}
            </p>
          </div>
          <div className="w-10"></div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto bg-white dark:bg-gray-900">
          {viewError ? (
            <ErrorView error={viewError} retry={retryView} />
          ) : CurrentView ? (
            <CurrentView />
          ) : (
            <ErrorView
              error={new Error('Vue non disponible')}
              retry={retryView}
            />
          )}
        </div>
      </div>
    </div>
  );
}
