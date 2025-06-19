'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '@/stores/auth-store';
import { Users, MessageCircle, Hash, TrendingUp, Activity, ThumbsUp, MessageSquare } from 'lucide-react';
import { JSX } from 'react';

interface ForumStats {
  total_topics: number;
  total_posts: number;
  total_users: number;
  categories: Array<{
    name: string;
    topics_count: number;
  }>;
}

interface UserStats {
  topics_created: number;
  posts_created: number;
  likes_received: number;
  messages_sent: number;
  active_threads: number;
}

export default function StatsView() {
  const { token } = useAuthStore();
  const [forumStats, setForumStats] = useState<ForumStats | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState({
    forum: false,
    user: false
  });
  const [error, setError] = useState({
    forum: '',
    user: ''
  });

  const fetchStats = async () => {
    setLoading(prev => ({ ...prev, forum: true, user: true }));
    setError(prev => ({ ...prev, forum: '', user: '' }));
    
    try {
      const [forumRes, userRes] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/stats/forum_stats/`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/stats/user_stats/`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      
      setForumStats(forumRes.data);
      setUserStats(userRes.data);
    } catch (err) {
      setError(prev => ({ ...prev, forum: 'Erreur stats forum', user: 'Erreur stats utilisateur' }));
    } finally {
      setLoading(prev => ({ ...prev, forum: false, user: false }));
    }
  };

  useEffect(() => {
    fetchStats();
  }, [token]);

  return (
    <div className="flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
      {/* En-tête avec le titre et la description */}
      <div className="p-6 border-b border-border/50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Statistiques de la Communauté</h1>
          <p className="text-muted-foreground">Aperçu de l'activité de votre plateforme AgriSmart</p>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="flex-1">
        <div className="max-w-7xl mx-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Carte des statistiques du forum */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-2xl p-6 border border-border/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
                <h3 className="text-xl font-semibold mb-6 flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-primary to-primary/80 rounded-xl shadow-lg">
                    <Hash size={24} className="text-primary-foreground" />
                  </div>
                  <span className="bg-gradient-to-r from-primary to-muted-foreground bg-clip-text text-transparent">
                    Statistiques du Forum
                  </span>
                </h3>
                
                {loading.forum && (
                  <div className="flex justify-center py-12">
                    <div className="relative">
                      <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/30" />
                      <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-primary absolute inset-0" />
                    </div>
                  </div>
                )}

                {error.forum && (
                  <div className="bg-gradient-to-r from-destructive/10 to-destructive/5 text-destructive p-6 rounded-xl border border-destructive/20 backdrop-blur-sm">
                    {error.forum}
                  </div>
                )}

                {!loading.forum && forumStats && (
                  <div className="space-y-8 animate-in fade-in duration-500">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      <StatCard 
                        label="Sujets"
                        value={forumStats.total_topics}
                        icon={<Hash size={18} className="text-white" />}
                        gradientFrom="from-blue-600"
                        gradientTo="to-cyan-600"
                      />
                      <StatCard 
                        label="Messages"
                        value={forumStats.total_posts}
                        icon={<MessageCircle size={18} className="text-white" />}
                        gradientFrom="from-emerald-600"
                        gradientTo="to-teal-600"
                      />
                      <StatCard 
                        label="Membres"
                        value={forumStats.total_users}
                        icon={<Users size={18} className="text-white" />}
                        gradientFrom="from-violet-600"
                        gradientTo="to-purple-600"
                      />
                    </div>

                    <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-6 border border-border/30">
                      <h4 className="font-semibold mb-4 text-lg flex items-center gap-2 text-foreground">
                        <TrendingUp size={20} className="text-primary" />
                        Activité par catégorie
                      </h4>
                      <div className="space-y-3">
                        {forumStats.categories.map((category, index) => (
                          <div 
                            key={index} 
                            className="flex items-center justify-between p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors duration-200 group"
                          >
                            <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                              {category.name}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-primary">{category.topics_count}</span>
                              <span className="text-xs text-muted-foreground">sujets</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Carte des statistiques utilisateur */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-accent/20 to-primary/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-2xl p-6 border border-border/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
                <h3 className="text-xl font-semibold mb-6 flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-accent to-accent/80 rounded-xl shadow-lg">
                    <Users size={24} className="text-accent-foreground" />
                  </div>
                  <span className="bg-gradient-to-r from-accent to-muted-foreground bg-clip-text text-transparent">
                    Vos Statistiques
                  </span>
                </h3>
                
                {loading.user ? (
                  <div className="flex justify-center py-12">
                    <div className="relative">
                      <div className="animate-spin rounded-full h-12 w-12 border-4 border-accent/30" />
                      <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-accent absolute inset-0" />
                    </div>
                  </div>
                ) : error.user ? (
                  <div className="bg-gradient-to-r from-destructive/10 to-destructive/5 text-destructive p-6 rounded-xl border border-destructive/20 backdrop-blur-sm">
                    {error.user}
                  </div>
                ) : userStats ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-in fade-in duration-500">
                    <StatCard 
                      label="Sujets créés"
                      value={userStats.topics_created}
                      icon={<Hash size={18} className="text-white" />}
                      gradientFrom="from-orange-500"
                      gradientTo="to-red-500"
                    />
                    <StatCard 
                      label="Messages postés"
                      value={userStats.posts_created}
                      icon={<MessageCircle size={18} className="text-white" />}
                      gradientFrom="from-green-500"
                      gradientTo="to-emerald-500"
                    />
                    <StatCard 
                      label="J'aime reçus"
                      value={userStats.likes_received}
                      icon={<ThumbsUp size={18} className="text-white" />}
                      gradientFrom="from-pink-500"
                      gradientTo="to-rose-500"
                    />
                    <StatCard 
                      label="Conversations"
                      value={userStats.active_threads}
                      icon={<MessageSquare size={18} className="text-white" />}
                      gradientFrom="from-indigo-500"
                      gradientTo="to-blue-500"
                    />
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Connectez-vous pour voir vos statistiques personnelles</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Composant de carte de statistique réutilisable
const StatCard = ({ label, value, icon, gradientFrom, gradientTo }: { label: string; value: number; icon: JSX.Element; gradientFrom: string; gradientTo: string }) => (
  <div className="relative group/card">
    <div className={`absolute inset-0 bg-gradient-to-br ${gradientFrom}/20 ${gradientTo}/20 rounded-xl blur opacity-0 group-hover/card:opacity-100 transition-opacity duration-300`} />
    <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 border border-border/30 hover:shadow-md transition-all duration-300">
      <div className="flex items-center gap-3">
        <div className={`p-2 bg-gradient-to-br ${gradientFrom} ${gradientTo} rounded-lg shadow`}>
          {icon}
        </div>
        <div>
          <p className="text-sm text-muted-foreground font-medium">{label}</p>
          <p className={`text-2xl font-bold bg-gradient-to-br ${gradientFrom} ${gradientTo} bg-clip-text text-transparent`}>
            {value}
          </p>
        </div>
      </div>
    </div>
  </div>
);