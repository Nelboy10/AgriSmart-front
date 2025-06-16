'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '@/stores/auth-store';
import { Users, MessageCircle, Hash, TrendingUp, Activity, ThumbsUp } from 'lucide-react';

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
    <div className="flex-1 p-4 overflow-auto bg-gradient-to-br from-background via-background to-muted/20 text-foreground min-h-screen">
      {/* Header avec animation */}
      <div className="mb-8 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-accent/10 rounded-2xl blur-xl" />
        <div className="relative bg-card/80 backdrop-blur-sm rounded-2xl p-6 border border-border/50 shadow-lg">
          <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Statistiques de la Communauté
          </h2>
          <p className="text-muted-foreground/80 text-lg">Aperçu de l'activité de votre plateforme AgriSmart</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Forum Stats */}
        <div className="group relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative bg-card/90 backdrop-blur-sm rounded-2xl p-8 border border-border/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-primary to-primary/80 rounded-xl shadow-lg">
                <Hash size={24} className="text-primary-foreground" />
              </div>
              <span className="bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
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
                  <div className="relative group/card">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl blur opacity-0 group-hover/card:opacity-100 transition-opacity duration-300" />
                    <div className="relative bg-gradient-to-br from-muted/30 to-muted/10 backdrop-blur-sm rounded-xl p-6 border border-border/30 hover:border-blue-500/30 transition-all duration-300">
                      <p className="text-sm text-muted-foreground/80 mb-2 font-medium">Sujets</p>
                      <p className="text-3xl font-bold bg-gradient-to-br from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                        {forumStats.total_topics}
                      </p>
                    </div>
                  </div>
                  <div className="relative group/card">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-xl blur opacity-0 group-hover/card:opacity-100 transition-opacity duration-300" />
                    <div className="relative bg-gradient-to-br from-muted/30 to-muted/10 backdrop-blur-sm rounded-xl p-6 border border-border/30 hover:border-emerald-500/30 transition-all duration-300">
                      <p className="text-sm text-muted-foreground/80 mb-2 font-medium">Messages</p>
                      <p className="text-3xl font-bold bg-gradient-to-br from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                        {forumStats.total_posts}
                      </p>
                    </div>
                  </div>
                  <div className="relative group/card">
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 to-purple-500/20 rounded-xl blur opacity-0 group-hover/card:opacity-100 transition-opacity duration-300" />
                    <div className="relative bg-gradient-to-br from-muted/30 to-muted/10 backdrop-blur-sm rounded-xl p-6 border border-border/30 hover:border-violet-500/30 transition-all duration-300">
                      <p className="text-sm text-muted-foreground/80 mb-2 font-medium">Membres</p>
                      <p className="text-3xl font-bold bg-gradient-to-br from-violet-600 to-purple-600 bg-clip-text text-transparent">
                        {forumStats.total_users}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl" />
                  <div className="relative p-6">
                    <h4 className="font-semibold mb-4 text-lg flex items-center gap-2">
                      <TrendingUp size={20} className="text-primary" />
                      Activité par catégorie
                    </h4>
                    <div className="space-y-4">
                      {forumStats.categories.map((category, index) => (
                        <div key={index} className="group/item flex items-center justify-between p-4 rounded-lg bg-muted/20 hover:bg-muted/30 transition-all duration-200 hover:scale-[1.02]">
                          <span className="text-muted-foreground group-hover/item:text-foreground transition-colors duration-200">
                            {category.name}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-primary">{category.topics_count}</span>
                            <span className="text-sm text-muted-foreground">sujets</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* User Stats */}
        <div className="group relative">
          <div className="absolute inset-0 bg-gradient-to-r from-accent/20 to-primary/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative bg-card/90 backdrop-blur-sm rounded-2xl p-8 border border-border/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-accent to-accent/80 rounded-xl shadow-lg">
                <Users size={24} className="text-accent-foreground" />
              </div>
              <span className="bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                Vos Statistiques
              </span>
            </h3>
            
            {loading.user && (
              <div className="flex justify-center py-12">
                <div className="relative">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-accent/30" />
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-accent absolute inset-0" />
                </div>
              </div>
            )}

            {error.user && (
              <div className="bg-gradient-to-r from-destructive/10 to-destructive/5 text-destructive p-6 rounded-xl border border-destructive/20 backdrop-blur-sm">
                {error.user}
              </div>
            )}

            {!loading.user && userStats && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-in fade-in duration-500">
                <div className="relative group/card">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-xl blur opacity-0 group-hover/card:opacity-100 transition-opacity duration-300" />
                  <div className="relative bg-gradient-to-br from-muted/30 to-muted/10 backdrop-blur-sm rounded-xl p-6 border border-border/30 hover:border-orange-500/30 transition-all duration-300">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg shadow">
                        <Hash size={18} className="text-white" />
                      </div>
                      <p className="text-sm text-muted-foreground/80 font-medium">Sujets créés</p>
                    </div>
                    <p className="text-3xl font-bold bg-gradient-to-br from-orange-600 to-red-600 bg-clip-text text-transparent">
                      {userStats.topics_created}
                    </p>
                  </div>
                </div>
                <div className="relative group/card">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl blur opacity-0 group-hover/card:opacity-100 transition-opacity duration-300" />
                  <div className="relative bg-gradient-to-br from-muted/30 to-muted/10 backdrop-blur-sm rounded-xl p-6 border border-border/30 hover:border-green-500/30 transition-all duration-300">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg shadow">
                        <MessageCircle size={18} className="text-white" />
                      </div>
                      <p className="text-sm text-muted-foreground/80 font-medium">Messages postés</p>
                    </div>
                    <p className="text-3xl font-bold bg-gradient-to-br from-green-600 to-emerald-600 bg-clip-text text-transparent">
                      {userStats.posts_created}
                    </p>
                  </div>
                </div>
                <div className="relative group/card">
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 to-rose-500/20 rounded-xl blur opacity-0 group-hover/card:opacity-100 transition-opacity duration-300" />
                  <div className="relative bg-gradient-to-br from-muted/30 to-muted/10 backdrop-blur-sm rounded-xl p-6 border border-border/30 hover:border-pink-500/30 transition-all duration-300">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-gradient-to-br from-pink-500 to-rose-500 rounded-lg shadow">
                        <ThumbsUp size={18} className="text-white" />
                      </div>
                      <p className="text-sm text-muted-foreground/80 font-medium">J'aime reçus</p>
                    </div>
                    <p className="text-3xl font-bold bg-gradient-to-br from-pink-600 to-rose-600 bg-clip-text text-transparent">
                      {userStats.likes_received}
                    </p>
                  </div>
                </div>
                <div className="relative group/card">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-blue-500/20 rounded-xl blur opacity-0 group-hover/card:opacity-100 transition-opacity duration-300" />
                  <div className="relative bg-gradient-to-br from-muted/30 to-muted/10 backdrop-blur-sm rounded-xl p-6 border border-border/30 hover:border-indigo-500/30 transition-all duration-300">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-lg shadow">
                        <Activity size={18} className="text-white" />
                      </div>
                      <p className="text-sm text-muted-foreground/80 font-medium">Conversations</p>
                    </div>
                    <p className="text-3xl font-bold bg-gradient-to-br from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                      {userStats.active_threads}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}