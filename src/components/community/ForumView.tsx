'use client';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuthStore } from '@/stores/auth-store';
import { 
  Hash, Search, Bell, Plus, ArrowLeft, Pin, Lock, Eye, MessageCircle, 
  ThumbsUp, Reply, MoreVertical, X, Check, Paperclip, Smile 
} from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';

interface Category {
  id: string;
  name: string;
  description: string;
  topics_count: number;
  last_activity: string;
}

interface Topic {
  id: string;
  title: string;
  content: string;
  category: string;
  author: { id: string; username: string };
  is_pinned: boolean;
  is_locked: boolean;
  views_count: number;
  posts_count: number;
  created_at: string;
  last_post?: { author: { username: string }; created_at: string };
}

interface Post {
  id: string;
  content: string;
  author: { id: string; username: string };
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
      <div className="flex-1 flex flex-col bg-background text-foreground">
        {/* Topic Header */}
        <div className="p-4 border-b border-border bg-card">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSelectedTopic(null)}
              className="p-2 rounded-lg hover:bg-accent"
            >
              <ArrowLeft className="text-muted-foreground" size={20} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                {selectedTopic.is_pinned && <Pin size={16} className="text-emerald-500" />}
                {selectedTopic.is_locked && <Lock size={16} className="text-destructive" />}
                <h2 className="text-xl font-bold">{selectedTopic.title}</h2>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>@{selectedTopic.author.username}</span>
                <span>{formatTimeAgo(selectedTopic.created_at)}</span>
                <span className="flex items-center gap-1">
                  <Eye size={14} />
                  <span>{selectedTopic.views_count} vues</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Posts List */}
        <div className="flex-1 overflow-auto p-4 space-y-6">
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
              <div className="bg-card rounded-xl p-6 border border-border">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xl">
                    {selectedTopic.author.username.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold">@{selectedTopic.author.username}</span>
                      <span className="text-sm text-muted-foreground">{formatTimeAgo(selectedTopic.created_at)}</span>
                    </div>
                    <p className="whitespace-pre-line">{selectedTopic.content}</p>
                  </div>
                </div>
              </div>

              {/* Replies */}
              {posts.map(post => (
                <div key={post.id} className="bg-card rounded-xl p-6 border border-border">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center text-secondary-foreground text-xl">
                      {post.author.username.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold">@{post.author.username}</span>
                        <span className="text-sm text-muted-foreground">
                          {formatTimeAgo(post.created_at)}
                          {post.is_edited && <span className="text-xs italic ml-2">(modifié)</span>}
                        </span>
                      </div>
                      <p className="whitespace-pre-line">{post.content}</p>
                      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border">
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
          <div className="p-4 border-t border-border bg-card">
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center text-accent-foreground">
                {user?.username.charAt(0)}
              </div>
              <div className="flex-1 relative">
                <textarea
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder="Écrivez votre réponse..."
                  rows={3}
                  className="w-full bg-input border border-border rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary/50 focus:border-primary resize-none"
                />
                <div className="flex justify-between items-center mt-2">
                  <div className="flex items-center gap-2">
                    <button 
                      type="button"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-accent"
                    >
                      <Smile size={18} />
                    </button>
                    <button className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-accent">
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

  if (selectedCategory) {
    return (
      <div className="flex-1 flex flex-col bg-background text-foreground">
        {/* Category Header */}
        <div className="p-4 border-b border-border bg-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSelectedCategory(null)}
                className="p-2 rounded-lg hover:bg-accent"
              >
                <ArrowLeft className="text-muted-foreground" size={20} />
              </button>
              <div>
                <h2 className="text-xl font-bold">{selectedCategory.name}</h2>
                <p className="text-muted-foreground">{selectedCategory.description}</p>
              </div>
            </div>
            <button 
              onClick={() => setShowNewTopic(true)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 flex items-center gap-2"
            >
              <Plus size={18} />
              <span>Nouveau sujet</span>
            </button>
          </div>
        </div>

        {/* Topics List */}
        <div className="flex-1 overflow-auto p-4">
          {loading.topics && (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
            </div>
          )}

          {error.topics && (
            <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
              {error.topics}
            </div>
          )}

          {!loading.topics && !error.topics && (
            <div className="space-y-4">
              {topics.map(topic => (
                <div
                  key={topic.id}
                  onClick={() => setSelectedTopic(topic)}
                  className="bg-card rounded-xl p-4 border border-border hover:border-primary/50 cursor-pointer transition-colors"
                >
                  <div className="flex justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {topic.is_pinned && <Pin size={16} className="text-emerald-500" />}
                        {topic.is_locked && <Lock size={16} className="text-destructive" />}
                        <h3 className="font-semibold hover:text-primary">{topic.title}</h3>
                      </div>
                      <p className="text-muted-foreground line-clamp-2 mb-3">{topic.content}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>@{topic.author.username}</span>
                        <span className="flex items-center gap-1">
                          <Eye size={14} />
                          <span>{topic.views_count}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle size={14} />
                          <span>{topic.posts_count}</span>
                        </span>
                        <span>{formatTimeAgo(topic.created_at)}</span>
                      </div>
                    </div>
                    {topic.last_post && (
                      <div className="text-right text-sm text-muted-foreground">
                        <p>Dernier message par</p>
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
            <div className="bg-card rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-border">
              <div className="p-6 border-b border-border">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold">Créer un nouveau sujet</h2>
                  <button
                    onClick={() => setShowNewTopic(false)}
                    className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-accent"
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
                      className="w-full bg-input border border-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/50 focus:border-primary"
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
                      className="w-full bg-input border border-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/50 focus:border-primary resize-none"
                    />
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-border flex justify-end gap-3">
                <button
                  onClick={() => setShowNewTopic(false)}
                  className="px-4 py-2 text-muted-foreground border border-border rounded-lg hover:bg-accent transition-colors"
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
    <div className="flex-1 flex flex-col bg-background text-foreground">
      {/* Forum Header */}
      <div className="p-4 border-b border-border bg-card">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Forum Communautaire</h2>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary w-64"
              />
            </div>
            {user?.is_online && (
              <button 
                onClick={() => setShowNewCategory(true)}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 flex items-center gap-2"
              >
                <Plus size={18} />
                <span>Nouvelle catégorie</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Categories List */}
      <div className="flex-1 overflow-auto p-4">
        {loading.categories && (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
          </div>
        )}

        {error.categories && (
          <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
            {error.categories}
          </div>
        )}

        {!loading.categories && !error.categories && (
          <div className="grid gap-6">
            {categories.map(category => (
              <div
                key={category.id}
                onClick={() => setSelectedCategory(category)}
                className="bg-card rounded-2xl p-6 border border-border hover:border-primary/50 cursor-pointer transition-colors"
              >
                <div className="flex justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500 text-2xl">
                      🌾
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">{category.name}</h3>
                      <p className="text-muted-foreground mb-3">{category.description}</p>
                      <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        <span>{category.topics_count} discussions</span>
                        <span>Dernière activité {formatTimeAgo(category.last_activity)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-emerald-500 font-medium">Actif</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Category Modal */}
      {showNewCategory && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl max-w-md w-full border border-border">
            <div className="p-6 border-b border-border">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Nouvelle catégorie</h2>
                <button
                  onClick={() => setShowNewCategory(false)}
                  className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-accent"
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
                    className="w-full bg-input border border-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/50 focus:border-primary"
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
                    className="w-full bg-input border border-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/50 focus:border-primary resize-none"
                    rows={3}
                  />
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-border flex justify-end gap-3">
              <button
                onClick={() => setShowNewCategory(false)}
                className="px-4 py-2 text-muted-foreground border border-border rounded-lg hover:bg-accent transition-colors"
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