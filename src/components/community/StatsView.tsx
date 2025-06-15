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
    <div className="flex-1 p-4 overflow-auto bg-background text-foreground">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Statistiques de la Communauté</h2>
        <p className="text-muted-foreground">Aperçu de l'activité de votre plateforme AgriSmart</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Forum Stats */}
        <div className="bg-card rounded-xl p-6 border border-border">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Hash size={20} className="text-primary" />
            Statistiques du Forum
          </h3>
          
          {loading.forum && (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
            </div>
          )}

          {error.forum && (
            <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
              {error.forum}
            </div>
          )}

          {!loading.forum && forumStats && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-muted/20 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-1">Sujets</p>
                  <p className="text-2xl font-bold">{forumStats.total_topics}</p>
                </div>
                <div className="bg-muted/20 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-1">Messages</p>
                  <p className="text-2xl font-bold">{forumStats.total_posts}</p>
                </div>
                <div className="bg-muted/20 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-1">Membres</p>
                  <p className="text-2xl font-bold">{forumStats.total_users}</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Activité par catégorie</h4>
                <div className="space-y-3">
                  {forumStats.categories.map((category, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-muted-foreground">{category.name}</span>
                      <span className="font-medium">{category.topics_count} sujets</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Stats */}
        <div className="bg-card rounded-xl p-6 border border-border">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Users size={20} className="text-primary" />
            Vos Statistiques
          </h3>
          
          {loading.user && (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
            </div>
          )}

          {error.user && (
            <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
              {error.user}
            </div>
          )}

          {!loading.user && userStats && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-muted/20 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Hash size={18} className="text-primary" />
                  <p className="text-sm text-muted-foreground">Sujets créés</p>
                </div>
                <p className="text-2xl font-bold">{userStats.topics_created}</p>
              </div>
              <div className="bg-muted/20 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <MessageCircle size={18} className="text-primary" />
                  <p className="text-sm text-muted-foreground">Messages postés</p>
                </div>
                <p className="text-2xl font-bold">{userStats.posts_created}</p>
              </div>
              <div className="bg-muted/20 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <ThumbsUp size={18} className="text-primary" />
                  <p className="text-sm text-muted-foreground">J'aime reçus</p>
                </div>
                <p className="text-2xl font-bold">{userStats.likes_received}</p>
              </div>
              <div className="bg-muted/20 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Activity size={18} className="text-primary" />
                  <p className="text-sm text-muted-foreground">Conversations</p>
                </div>
                <p className="text-2xl font-bold">{userStats.active_threads}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}