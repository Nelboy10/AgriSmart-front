'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { MessageSquare, Plus, Users, Clock, ArrowRight, Search, Filter, TrendingUp } from 'lucide-react';

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

interface User {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  photo?: string;
}

interface Category {
  id: string;
  name: string;
  description: string;
  topics_count: number;
  icon?: string;
}

interface Topic {
  id: string;
  title: string;
  content: string;
  category: Category;
  author: User;
  created_at: string;
  updated_at: string;
  posts_count: number;
  is_pinned: boolean;
  last_post_at: string;
}

interface Post {
  id: string;
  content: string;
  author: User;
  topic: string;
  created_at: string;
  likes_count: number;
}

export default function ForumPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [view, setView] = useState<'categories' | 'topics' | 'posts'>('categories');
  const [searchQuery, setSearchQuery] = useState('');
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicContent, setNewTopicContent] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [showNewTopicForm, setShowNewTopicForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUser();
    fetchCategories();
  }, []);

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${apiUrl}/api/auth/users/me/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    }
  };

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${apiUrl}/api/forum/categories/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCategories(response.data.results || []);
    } catch (error) {
      console.error('Erreur lors de la récupération des catégories:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTopics = async (categoryId: string) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${apiUrl}/api/forum/topics/?category=${categoryId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTopics(response.data.results || []);
    } catch (error) {
      console.error('Erreur lors de la récupération des sujets:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async (topicId: string) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${apiUrl}/api/forum/posts/?topic=${topicId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPosts(response.data.results || []);
    } catch (error) {
      console.error('Erreur lors de la récupération des posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTopic = async () => {
    if (!newTopicTitle.trim() || !newTopicContent.trim()) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${apiUrl}/api/forum/topics/`, {
        title: newTopicTitle,
        content: newTopicContent,
        category: selectedCategory
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setNewTopicTitle('');
      setNewTopicContent('');
      setShowNewTopicForm(false);
      fetchTopics(selectedCategory);
    } catch (error) {
      console.error('Erreur lors de la création du sujet:', error);
    }
  };

  const createPost = async () => {
    if (!newPostContent.trim() || !selectedTopic) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${apiUrl}/api/forum/posts/`, {
        content: newPostContent,
        topic: selectedTopic.id
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setNewPostContent('');
      fetchPosts(selectedTopic.id);
    } catch (error) {
      console.error('Erreur lors de la création du post:', error);
    }
  };

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setView('topics');
    fetchTopics(categoryId);
  };

  const handleTopicClick = (topic: Topic) => {
    setSelectedTopic(topic);
    setView('posts');
    fetchPosts(topic.id);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
     
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Categories View */}
        {view === 'categories' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold text-gray-900">Catégories du Forum</h2>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <TrendingUp className="w-4 h-4" />
                <span>{categories.length} catégories disponibles</span>
              </div>
            </div>
            
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    onClick={() => handleCategoryClick(category.id)}
                    className="group bg-white/60 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/80 transition-all duration-300 cursor-pointer border border-green-100/50 hover:border-green-300/50 hover:shadow-xl hover:shadow-green-100/20"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <MessageSquare className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">{category.topics_count}</div>
                        <div className="text-xs text-gray-500">sujets</div>
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {category.description}
                    </p>
                    
                    <div className="mt-4 flex items-center text-sm text-gray-500">
                      <Users className="w-4 h-4 mr-1" />
                      <span>Communauté active</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Topics View */}
        {view === 'topics' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold text-gray-900">Sujets de discussion</h2>
              <button
                onClick={() => setShowNewTopicForm(true)}
                className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-blue-600 transition-all duration-200 flex items-center space-x-2 font-medium shadow-lg hover:shadow-xl"
              >
                <Plus className="w-5 h-5" />
                <span>Nouveau sujet</span>
              </button>
            </div>

            {/* New Topic Form */}
            {showNewTopicForm && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-green-200/50">
                <h3 className="text-lg font-semibold mb-4">Créer un nouveau sujet</h3>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Titre du sujet"
                    value={newTopicTitle}
                    onChange={(e) => setNewTopicTitle(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <textarea
                    placeholder="Contenu du sujet"
                    value={newTopicContent}
                    onChange={(e) => setNewTopicContent(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  />
                  <div className="flex space-x-3">
                    <button
                      onClick={createTopic}
                      className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
                    >
                      Publier
                    </button>
                    <button
                      onClick={() => setShowNewTopicForm(false)}
                      className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Topics List */}
            <div className="space-y-4">
              {topics.map((topic) => (
                <div
                  key={topic.id}
                  onClick={() => handleTopicClick(topic)}
                  className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/80 transition-all duration-200 cursor-pointer border border-green-100/50 hover:border-green-300/50 hover:shadow-lg"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        {topic.is_pinned && (
                          <div className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                            Épinglé
                          </div>
                        )}
                        <h3 className="text-lg font-semibold text-gray-900 hover:text-green-600 transition-colors">
                          {topic.title}
                        </h3>
                      </div>
                      
                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {topic.content}
                      </p>
                      
                      <div className="flex items-center space-x-6 text-sm text-gray-500">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white text-xs">
                            {getInitials(topic.author.first_name, topic.author.last_name)}
                          </div>
                          <span>{topic.author.first_name} {topic.author.last_name}</span>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <MessageSquare className="w-4 h-4" />
                          <span>{topic.posts_count} réponses</span>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{formatDate(topic.created_at)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-green-500 transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Posts View */}
        {view === 'posts' && selectedTopic && (
          <div className="space-y-6">
            {/* Topic Header */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-green-200/50">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedTopic.title}</h2>
              <p className="text-gray-600 mb-4">{selectedTopic.content}</p>
              
              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white text-sm">
                    {getInitials(selectedTopic.author.first_name, selectedTopic.author.last_name)}
                  </div>
                  <span className="font-medium">Par {selectedTopic.author.first_name} {selectedTopic.author.last_name}</span>
                </div>
                
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{formatDate(selectedTopic.created_at)}</span>
                </div>
                
                <div className="flex items-center space-x-1">
                  <MessageSquare className="w-4 h-4" />
                  <span>{selectedTopic.posts_count} réponses</span>
                </div>
              </div>
            </div>

            {/* New Post Form */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-green-200/50">
              <h3 className="text-lg font-semibold mb-4">Répondre au sujet</h3>
              <div className="space-y-4">
                <textarea
                  placeholder="Votre réponse..."
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                />
                <button
                  onClick={createPost}
                  className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
                >
                  Publier la réponse
                </button>
              </div>
            </div>

            {/* Posts List */}
            <div className="space-y-4">
              {posts.map((post) => (
                <div key={post.id} className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-green-100/50">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                      {getInitials(post.author.first_name, post.author.last_name)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="font-medium text-gray-900">
                          {post.author.first_name} {post.author.last_name}
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatDate(post.created_at)}
                        </span>
                      </div>
                      
                      <p className="text-gray-700 leading-relaxed mb-3">
                        {post.content}
                      </p>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <button className="flex items-center space-x-1 hover:text-green-600 transition-colors">
                          <span>❤️</span>
                          <span>{post.likes_count} j'aime</span>
                        </button>
                        <button className="hover:text-green-600 transition-colors">
                          Répondre
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}