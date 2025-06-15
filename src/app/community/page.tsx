'use client';
import { useState } from 'react';
import { MessageCircle, Users, Plus, Search, Bell, Settings, Hash, TrendingUp, Menu, X } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import dynamic from 'next/dynamic';

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
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
  </div>
);

const ErrorView = ({ error, retry }: { error: Error, retry: () => void }) => (
  <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-background text-foreground">
    <div className="bg-destructive/15 p-4 rounded-full mb-4">
      <X className="text-destructive" size={24} />
    </div>
    <h2 className="text-xl font-bold mb-2">Erreur de chargement</h2>
    <p className="text-muted-foreground mb-6 max-w-md">{error.message}</p>
    <button
      onClick={retry}
      className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
    >
      Réessayer
    </button>
  </div>
);

export default function CommunityPage() {
  const { user, token, error: authError } = useAuthStore();
  const [activeView, setActiveView] = useState<'forum' | 'chat' | 'stats'>('forum');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewError, setViewError] = useState<Error | null>(null);

  const navigation = [
    { id: 'forum', label: 'Forum', icon: Hash, component: ForumView },
    { id: 'chat', label: 'Messages', icon: MessageCircle, component: ChatView },
    { id: 'stats', label: 'Statistiques', icon: TrendingUp, component: StatsView },
  ];

  const handleViewChange = (viewId: 'forum' | 'chat' | 'stats') => {
    setViewError(null);
    setActiveView(viewId);
    setSidebarOpen(false);
  };

  const retryView = () => {
    setViewError(null);
    // Réinitialiser le state pour forcer le rechargement
    const current = activeView;
    setActiveView('forum');
    setTimeout(() => setActiveView(current), 10);
  };

  if (!token) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="h-screen flex flex-col items-center justify-center p-6 text-center bg-background text-foreground">
        <div className="bg-destructive/15 p-4 rounded-full mb-4">
          <X className="text-destructive" size={24} />
        </div>
        <h2 className="text-xl font-bold mb-2">Erreur d'authentification</h2>
        <p className="text-muted-foreground mb-6 max-w-md">{authError}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          Recharger la page
        </button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen flex flex-col items-center justify-center p-6 text-center bg-background text-foreground">
        <div className="bg-yellow-500/15 p-4 rounded-full mb-4">
          <Users className="text-yellow-500" size={24} />
        </div>
        <h2 className="text-xl font-bold mb-2">Connexion requise</h2>
        <p className="text-muted-foreground mb-6 max-w-md">Vous devez être connecté pour accéder à la communauté</p>
        <button
          onClick={() => window.location.href = '/login'}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          Se connecter
        </button>
      </div>
    );
  }

  const CurrentView = navigation.find(nav => nav.id === activeView)?.component;

  return (
    <div className="h-screen flex bg-background text-foreground">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 w-80 bg-card/95 backdrop-blur-xl border-r border-border 
        flex flex-col transition-transform duration-300 ease-in-out shadow-2xl lg:shadow-none
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Header */}
        <div className="p-6 border-b border-border bg-gradient-to-r from-emerald-500/10 to-emerald-600/10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent">
                🌾 AgriSmart
              </h1>
              <p className="text-sm text-emerald-500/80 font-medium">Communauté Agricole</p>
            </div>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 hover:bg-accent rounded-xl transition-colors"
            >
              <X size={20} className="text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-border">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Rechercher..."
              className="w-full pl-10 pr-4 py-3 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
            />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navigation.map((item) => (
            <button
              key={item.id}
              onClick={() => handleViewChange(item.id as 'forum' | 'chat' | 'stats')}
              className={`
                w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl font-medium
                transition-all duration-200 group relative overflow-hidden
                ${activeView === item.id
                  ? 'bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-lg shadow-primary/25'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                }
              `}
            >
              <item.icon size={20} className={`${activeView === item.id ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground'} transition-colors`} />
              <span>{item.label}</span>
              {activeView === item.id && (
                <div className="absolute right-3 w-2 h-2 bg-primary-foreground rounded-full animate-pulse" />
              )}
            </button>
          ))}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-border bg-gradient-to-r from-card to-accent/10">
          <div className="flex items-center space-x-3 p-3 rounded-xl hover:bg-accent/30 transition-all duration-200 cursor-pointer group">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/90 rounded-xl flex items-center justify-center text-primary-foreground font-bold shadow-lg">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <p className="font-semibold">@{user.username}</p>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <p className="text-sm text-muted-foreground">En ligne</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-all duration-200">
                <Bell size={16} />
              </button>
              <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-all duration-200">
                <Settings size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <div className="lg:hidden bg-card/95 backdrop-blur-xl border-b border-border p-4 flex items-center justify-between">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="p-2 hover:bg-accent rounded-xl transition-colors"
          >
            <Menu size={24} className="text-foreground" />
          </button>
          <h1 className="font-bold">{navigation.find(nav => nav.id === activeView)?.label}</h1>
          <div className="w-10"></div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
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