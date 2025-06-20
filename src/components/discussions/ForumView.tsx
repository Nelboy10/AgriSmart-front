'use client';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuthStore } from '@/stores/auth-store';
import Link from 'next/link';
import { 
  Hash, Search, Users,Clock, Bell,Leaf, Plus, ArrowLeft, Pin, Lock, Eye, MessageCircle, 
  ThumbsUp, Reply, MoreVertical, X, Check, Paperclip, Smile 
} from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';


interface User {
  id: number;
  username: string;
  email: string;
  photo?: string;
  is_online: boolean;
}

interface Category {
  id: string;
  name: string;
  description: string;
  topics_count: number;
  last_activity: string;
  creator: User | null;
  creator_online: boolean;
}

interface Topic {
  id: string;
  title: string;
  content: string;
  category: string;
  author: User;
  is_pinned: boolean;
  is_locked: boolean;
  views_count: number;
  posts_count: number;
  created_at: string;
  last_post?: { author: User; created_at: string };
}

interface Post {
  id: string;
  content: string;
  author: User;
  created_at: string;
  is_edited: boolean;
  likes_count: number;
  user_has_liked: boolean;
}

export default function ForumView() {
  const { token, user } = useAuthStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [newPostContent, setNewPostContent] = useState('');
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [showNewTopic, setShowNewTopic] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [newTopic, setNewTopic] = useState({ title: '', content: '' });
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState({
    categories: false,
    topics: false,
    posts: false,
    posting: false
  });
  const [error, setError] = useState({
    categories: '',
    topics: '',
    posts: '',
    posting: ''
  });
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  // Fermer le sélecteur d'emoji quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchCategories = async () => {
    setLoading(prev => ({ ...prev, categories: true }));
    setError(prev => ({ ...prev, categories: '' }));
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/forum/categories/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCategories(res.data);
    } catch (err) {
      setError(prev => ({ ...prev, categories: 'Erreur lors du chargement des catégories' }));
    } finally {
      setLoading(prev => ({ ...prev, categories: false }));
    }
  };

  const fetchTopics = async (categoryId: string) => {
    setLoading(prev => ({ ...prev, topics: true }));
    setError(prev => ({ ...prev, topics: '' }));
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/forum/topics/?category=${categoryId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTopics(res.data);
    } catch (err) {
      setError(prev => ({ ...prev, topics: 'Erreur lors du chargement des sujets' }));
    } finally {
      setLoading(prev => ({ ...prev, topics: false }));
    }
  };

  const fetchPosts = async (topicId: string) => {
    setLoading(prev => ({ ...prev, posts: true }));
    setError(prev => ({ ...prev, posts: '' }));
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/forum/posts/?topic=${topicId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPosts(res.data);
    } catch (err) {
      setError(prev => ({ ...prev, posts: 'Erreur lors du chargement des messages' }));
    } finally {
      setLoading(prev => ({ ...prev, posts: false }));
    }
  };

  const createCategory = async () => {
    if (!newCategory.name.trim()) return;
    
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/forum/categories/`, newCategory, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowNewCategory(false);
      setNewCategory({ name: '', description: '' });
      fetchCategories();
    } catch (err) {
      console.error('Error creating category:', err);
    }
  };

  const createTopic = async () => {
    if (!newTopic.title.trim() || !newTopic.content.trim() || !selectedCategory) return;
    
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/forum/topics/`, {
        ...newTopic,
        category: selectedCategory.id
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowNewTopic(false);
      setNewTopic({ title: '', content: '' });
      fetchTopics(selectedCategory.id);
    } catch (err) {
      console.error('Error creating topic:', err);
    }
  };

  const createPost = async () => {
    if (!newPostContent.trim() || !selectedTopic) return;
    
    setLoading(prev => ({ ...prev, posting: true }));
    setError(prev => ({ ...prev, posting: '' }));
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/forum/posts/`, {
        content: newPostContent,
        topic: selectedTopic.id
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewPostContent('');
      fetchPosts(selectedTopic.id);
    } catch (err) {
      setError(prev => ({ ...prev, posting: 'Erreur lors de la publication' }));
    } finally {
      setLoading(prev => ({ ...prev, posting: false }));
    }
  };

  const toggleLike = async (postId: string) => {
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/forum/posts/${postId}/toggle_like/`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (selectedTopic) fetchPosts(selectedTopic.id);
    } catch (err) {
      console.error('Error toggling like:', err);
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = now.getTime() - time.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `${minutes}min`;
    if (hours < 24) return `${hours}h`;
    return `${days}j`;
  };

  useEffect(() => {
    fetchCategories();
  }, [token]);

  useEffect(() => {
    if (selectedCategory) fetchTopics(selectedCategory.id);
  }, [selectedCategory, token]);

  useEffect(() => {
    if (selectedTopic) fetchPosts(selectedTopic.id);
  }, [selectedTopic, token]);

  if (selectedTopic) {
    return (
      <div className="flex-1 flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
        {/* Topic Header */}
        <div className="p-2 sm:p-4 border-b border-border bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm">
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => setSelectedTopic(null)}
              className="p-1 sm:p-2 rounded-lg hover:bg-accent/50 flex-shrink-0"
              aria-label="Retour"
            >
              <ArrowLeft className="text-muted-foreground w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                {selectedTopic.is_pinned && <Pin size={14} className="text-emerald-500 flex-shrink-0" />}
                {selectedTopic.is_locked && <Lock size={14} className="text-destructive flex-shrink-0" />}
                <h2 className="text-base sm:text-xl font-bold truncate">{selectedTopic.title}</h2>
              </div>
              <div className="flex items-center gap-1 sm:gap-4 text-xs sm:text-sm text-muted-foreground flex-wrap">
                <span className="truncate">
                  <Link href={`/profile/${selectedTopic.author.id}`} className="hover:underline">
                    @{selectedTopic.author.username}
                  </Link>
                </span>
                <span className="hidden sm:inline">•</span>
                <span>{formatTimeAgo(selectedTopic.created_at)}</span>
                <span className="hidden sm:inline">•</span>
                <span className="flex items-center gap-1">
                  <Eye size={12} className="flex-shrink-0" />
                  <span>{selectedTopic.views_count} vues</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Posts List */}
        <div className="flex-1 overflow-auto p-2 sm:p-4 space-y-3 sm:space-y-6">
          {loading.posts && (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
            </div>
          )}

          {error.posts && (
            <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
              {error.posts}
            </div>
          )}

          {!loading.posts && !error.posts && (
            <>
              {/* Main Topic Post */}
              <div className="bg-white/90 dark:bg-gray-900/90 rounded-xl p-3 sm:p-6 border border-border/50 backdrop-blur-sm">
                <div className="flex gap-2 sm:gap-4">
                  <div className="w-8 h-8 sm:w-12 sm:h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm sm:text-xl overflow-hidden flex-shrink-0">
                    <Link href={`/profile/${selectedTopic.author.id}`} className="w-full h-full flex items-center justify-center">
                      {selectedTopic.author.photo ? (
                        <img src={selectedTopic.author.photo} alt={selectedTopic.author.username} className="w-full h-full object-cover" />
                      ) : (
                        selectedTopic.author.username.charAt(0)
                      )}
                    </Link>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2 flex-wrap">
                      <span className="font-semibold text-sm sm:text-base">
                        <Link href={`/profile/${selectedTopic.author.id}`} className="hover:underline">
                          @{selectedTopic.author.username}
                        </Link>
                      </span>
                      <span className="text-xs sm:text-sm text-muted-foreground">{formatTimeAgo(selectedTopic.created_at)}</span>
                    </div>
                    <p className="whitespace-pre-line text-sm sm:text-base">{selectedTopic.content}</p>
                  </div>
                </div>
              </div>

              {/* Replies */}
              {posts.map(post => (
                <div key={post.id} className="bg-white/90 dark:bg-gray-900/90 rounded-xl p-3 sm:p-6 border border-border/50 backdrop-blur-sm">
                  <div className="flex gap-2 sm:gap-4">
                    <div className="w-8 h-8 sm:w-12 sm:h-12 bg-secondary rounded-full flex items-center justify-center text-secondary-foreground text-sm sm:text-xl overflow-hidden flex-shrink-0">
                      <Link href={`/profile/${post.author.id}`} className="w-full h-full flex items-center justify-center">
                        {post.author.photo ? (
                          <img src={post.author.photo} alt={post.author.username} className="w-full h-full object-cover" />
                        ) : (
                          post.author.username.charAt(0)
                        )}
                      </Link>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2 flex-wrap">
                        <span className="font-semibold text-sm sm:text-base">
                          <Link href={`/profile/${post.author.id}`} className="hover:underline">
                            @{post.author.username}
                          </Link>
                        </span>
                        <span className="text-xs sm:text-sm text-muted-foreground">
                          {formatTimeAgo(post.created_at)}
                          {post.is_edited && <span className="text-xs italic ml-2">(modifié)</span>}
                        </span>
                      </div>
                      <p className="whitespace-pre-line text-sm sm:text-base">{post.content}</p>
                      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border/50">
                        <button 
                          onClick={() => toggleLike(post.id)}
                          className={`flex items-center gap-1 ${post.user_has_liked ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                          <ThumbsUp size={16} />
                          <span>{post.likes_count}</span>
                        </button>
                        <button className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
                          <Reply size={16} />
                          <span>Répondre</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* New Post Form */}
        {!selectedTopic.is_locked && (
          <div className="p-2 sm:p-4 border-t border-border/50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm">
            <div className="flex gap-2 sm:gap-4">
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-accent rounded-full flex items-center justify-center text-accent-foreground text-sm sm:text-xl overflow-hidden flex-shrink-0">
                <Link href={`/profile/${user?.id}`} className="w-full h-full flex items-center justify-center">
                  {user?.photo ? (
                    <img src={user.photo} alt={user.username} className="w-full h-full object-cover" />
                  ) : (
                    user?.username.charAt(0)
                  )}
                </Link>
              </div>
              <div className="min-w-0 flex-1 relative">
                <textarea
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder="Écrivez votre réponse..."
                  rows={3}
                  className="w-full bg-input border border-border/50 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/50 focus:border-primary resize-none"
                />
                <div className="flex justify-between items-center mt-2">
                  <div className="flex items-center gap-2">
                    <button 
                      type="button"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-accent/50"
                    >
                      <Smile size={18} />
                    </button>
                    <button className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-accent/50">
                      <Paperclip size={18} />
                    </button>
                  </div>
                  <button
                    onClick={createPost}
                    disabled={!newPostContent.trim() || loading.posting}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {loading.posting ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-primary-foreground" />
                    ) : (
                      <>
                        <span>Publier</span>
                      </>
                    )}
                  </button>
                </div>
                
                {showEmojiPicker && (
                  <div ref={emojiPickerRef} className="absolute bottom-14 left-0 z-10">
                    <EmojiPicker 
                      onEmojiClick={(emojiData) => {
                        setNewPostContent(prev => prev + emojiData.emoji);
                      }}
                      width={300}
                      height={350}
                      previewConfig={{ showPreview: false }}
                    />
                  </div>
                )}
              </div>
            </div>
            {error.posting && (
              <div className="mt-2 text-sm text-destructive">{error.posting}</div>
            )}
          </div>
        )}
      </div>
    );
  }

   // Liste des topics dans une catégorie
   if (selectedCategory) {
    return (
      <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSelectedCategory(null)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <ArrowLeft size={20} className="text-gray-600 dark:text-gray-300" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">{selectedCategory.name}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">{selectedCategory.description}</p>
            </div>
          </div>
          <button 
            onClick={() => setShowNewTopic(true)}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-full flex items-center gap-2 transition-colors shadow-sm"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Nouveau sujet</span>
          </button>
        </div>

        {/* Liste des topics */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading.topics && (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
            </div>
          )}

          {!loading.topics && !error.topics && (
            <div className="space-y-3">
              {topics.map(topic => (
                <div
                  key={topic.id}
                  onClick={() => setSelectedTopic(topic)}
                  className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 cursor-pointer transition-all duration-200 hover:shadow-md"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold overflow-hidden shrink-0">
                      {topic.author.photo ? (
                        <img src={topic.author.photo} alt="" className="w-full h-full object-cover" />
                      ) : (
                        topic.author.username.charAt(0).toUpperCase()
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {topic.is_pinned && <Pin size={16} className="text-amber-500" />}
                        {topic.is_locked && <Lock size={16} className="text-red-500" />}
                        <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                          {topic.title}
                        </h3>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 mb-2">
                        {topic.content}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Users size={12} />
                          @{topic.author.username}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye size={12} />
                          {topic.views_count}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle size={12} />
                          {topic.posts_count}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {formatTimeAgo(topic.created_at)}
                        </span>
                      </div>
                    </div>
                    
                    {topic.last_post && (
                      <div className="text-right text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                        <p>Dernier message</p>
                        <p className="font-medium">@{topic.last_post.author.username}</p>
                        <p>{formatTimeAgo(topic.last_post.created_at)}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>


        {/* New Topic Modal */}
        {showNewTopic && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white/95 dark:bg-gray-900/95 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-border/50 backdrop-blur-sm">
              <div className="p-6 border-b border-border/50">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Créer un nouveau sujet</h2>
                  <button
                    onClick={() => setShowNewTopic(false)}
                    className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-accent/50"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Titre du sujet
                    </label>
                    <input
                      type="text"
                      value={newTopic.title}
                      onChange={(e) => setNewTopic({ ...newTopic, title: e.target.value })}
                      placeholder="Donnez un titre à votre sujet..."
                      className="w-full bg-input border border-border/50 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/50 focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Contenu
                    </label>
                    <textarea
                      rows={6}
                      value={newTopic.content}
                      onChange={(e) => setNewTopic({ ...newTopic, content: e.target.value })}
                      placeholder="Développez votre sujet ici..."
                      className="w-full bg-input border border-border/50 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/50 focus:border-primary resize-none"
                    />
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-border/50 flex justify-end gap-3">
                <button
                  onClick={() => setShowNewTopic(false)}
                  className="px-4 py-2 text-muted-foreground border border-border/50 rounded-lg hover:bg-accent/50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={createTopic}
                  disabled={!newTopic.title.trim() || !newTopic.content.trim()}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Publier
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-800/30">
    {/* Header */}
    <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-green-600 rounded-xl flex items-center justify-center">
          <MessageCircle className="text-white" size={20} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Forum</h1>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-full text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 w-64 transition-colors"
          />
        </div>
        {user && (
          <button 
            onClick={() => setShowNewCategory(true)}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-full flex items-center gap-2 transition-colors shadow-sm"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Nouvelle catégorie</span>
          </button>
        )}
      </div>
    </div>

    {/* Categories List */}
    <div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-800/30">
        {loading.categories && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-emerald-500" />
          </div>
        )}

        {error.categories && (
          <div className="mx-4 mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 p-3 rounded-lg text-sm">
            {error.categories}
          </div>
        )}

        {!loading.categories && !error.categories && (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {categories.length > 0 ? (
              categories.map(category => (
                <div
                  key={category.id}
                  onClick={() => setSelectedCategory(category)}
                  className="bg-white dark:bg-gray-900/50 hover:bg-gray-50 dark:hover:bg-gray-800/60 cursor-pointer transition-colors active:bg-gray-100 dark:active:bg-gray-700/50"
                >
                  <div className="flex items-center px-4 py-6">
                    {/* Avatar/Icon */}
                    <div className="flex-shrink-0 mr-3">
                      <div className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center">
                        <Leaf className="h-6 w-6 text-white" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0 mr-3">
                          <h3 className="text-base font-medium text-gray-900 dark:text-gray-100 truncate">
                            {category.name}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-0.5">
                            {category.description}
                          </p>
                          <div className="flex items-center mt-1 text-xs text-gray-400 dark:text-gray-500">
                            <span>{category.topics_count} discussions</span>
                          </div>
                        </div>

                        {/* Right side info */}
                        <div className="flex flex-col items-end flex-shrink-0">
                          <span className="text-xs text-gray-400 dark:text-gray-500 mb-1">
                            {formatTimeAgo(category.last_activity)}
                          </span>
                          <div className="flex items-center">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-16 px-4">
                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                  <Hash className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2 text-center">
                  Aucune catégorie disponible
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-center mb-6 max-w-sm">
                  Il n'y a pas encore de catégories de discussion disponibles.
                </p>
                {user && (
                  <button
                    onClick={() => setShowNewCategory(true)}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-full font-medium shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
                  >
                    <Plus size={16} />
                    <span>Créer une catégorie</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* New Category Modal */}
      {showNewCategory && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/95 dark:bg-gray-900/95 rounded-2xl max-w-md w-full border border-border/50 backdrop-blur-sm">
            <div className="p-6 border-b border-border/50">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Nouvelle catégorie</h2>
                <button
                  onClick={() => setShowNewCategory(false)}
                  className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-accent/50"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Nom de la catégorie
                  </label>
                  <input
                    type="text"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                    placeholder="Nom de la nouvelle catégorie..."
                    className="w-full bg-input border border-border/50 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Description
                  </label>
                  <textarea
                    value={newCategory.description}
                    onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                    placeholder="Description de la catégorie..."
                    className="w-full bg-input border border-border/50 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/50 focus:border-primary resize-none"
                    rows={3}
                  />
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-border/50 flex justify-end gap-3">
              <button
                onClick={() => setShowNewCategory(false)}
                className="px-4 py-2 text-muted-foreground border border-border/50 rounded-lg hover:bg-accent/50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={createCategory}
                disabled={!newCategory.name.trim()}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Créer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}