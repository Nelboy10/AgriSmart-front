import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuthStore } from '@/stores/auth-store';
import {
  Hash, Users, Clock, Bell, Leaf, Plus, ArrowLeft, Pin, Lock, Eye, MessageCircle,
  ThumbsUp, Reply, MoreVertical, X, Check, Paperclip, Smile, User, Image
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
  const [loading, setLoading] = useState({
    categories: false,
    topics: false,
    posts: false,
    posting: false,
  });
  const [error, setError] = useState({
    categories: '',
    topics: '',
    posts: '',
    posting: '',
  });
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [mobileView, setMobileView] = useState<'categories' | 'topics' | 'posts'>('categories');
  const emojiPickerRef = useRef<HTMLDivElement>(null!);
  const containerRef = useRef<HTMLDivElement>(null!);

  // Check screen size and adjust view
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        if (selectedTopic) {
          setMobileView('posts');
        } else if (selectedCategory) {
          setMobileView('topics');
        } else {
          setMobileView('categories');
        }
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [selectedCategory, selectedTopic]);

  // Handle click outside emoji picker
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

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
    setSelectedTopic(null);
    if (window.innerWidth < 768) {
      setMobileView('topics');
    }
    fetchTopics(category.id);
  };

  const handleTopicSelect = (topic: Topic) => {
    setSelectedTopic(topic);
    if (window.innerWidth < 768) {
      setMobileView('posts');
    }
    fetchPosts(topic.id);
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

  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setSelectedTopic(null);
    setMobileView('categories');
  };

  const handleBackToTopics = () => {
    setSelectedTopic(null);
    setMobileView('topics');
  };

  useEffect(() => {
    fetchCategories();
  }, [token]);

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900" ref={containerRef}>
      {/* Mobile Navigation Header */}
      <div className="md:hidden flex items-center p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        {mobileView !== 'categories' && (
          <button
            onClick={mobileView === 'posts' ? handleBackToTopics : handleBackToCategories}
            className="mr-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ArrowLeft size={20} className="text-gray-600 dark:text-gray-300" />
          </button>
        )}
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          {mobileView === 'categories' && 'Catégories'}
          {mobileView === 'topics' && selectedCategory?.name}
          {mobileView === 'posts' && selectedTopic?.title}
        </h2>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex flex-1 overflow-hidden">
        {/* Sidebar des catégories */}
        <div className={`w-80 border-r border-gray-200 dark:border-gray-800 flex flex-col h-full bg-white dark:bg-gray-900`}>
          <div className="p-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Catégories</h2>
              <button
                onClick={() => setShowNewCategory(true)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <Plus size={20} className="text-gray-600 dark:text-gray-300" />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading.categories ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
              </div>
            ) : categories.length > 0 ? (
              categories.map((category) => (
                <div
                  key={category.id}
                  onClick={() => handleCategorySelect(category)}
                  className={`p-4 border-b border-gray-100 dark:border-gray-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${selectedCategory?.id === category.id ? 'bg-gray-50 dark:bg-gray-800' : ''}`}
                >
                  <h3 className="font-medium text-gray-900 dark:text-white">{category.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {category.topics_count} sujets
                  </p>
                  <div className="flex items-center mt-2 text-xs text-gray-400">
                    <Clock size={12} className="mr-1" />
                    <span>Dernière activité: {formatTimeAgo(category.last_activity)}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                <p>Aucune catégorie trouvée</p>
              </div>
            )}
          </div>
        </div>

        {/* Contenu principal */}
        <div className="flex-1 flex flex-col h-full">
          {selectedCategory ? (
            selectedTopic ? (
              <TopicPostsView 
                selectedTopic={selectedTopic}
                posts={posts}
                loading={loading}
                newPostContent={newPostContent}
                setNewPostContent={setNewPostContent}
                showEmojiPicker={showEmojiPicker}
                setShowEmojiPicker={setShowEmojiPicker}
                emojiPickerRef={emojiPickerRef}
                createPost={createPost}
                formatTimeAgo={formatTimeAgo}
                onBack={() => setSelectedTopic(null)}
              />
            ) : (
              <TopicsListView 
                selectedCategory={selectedCategory}
                topics={topics}
                loading={loading}
                setShowNewTopic={setShowNewTopic}
                handleTopicSelect={handleTopicSelect}
                formatTimeAgo={formatTimeAgo}
              />
            )
          ) : (
            <EmptyForumView 
              setShowNewCategory={setShowNewCategory}
            />
          )}
        </div>
      </div>

      {/* Mobile Views */}
      <div className="md:hidden flex-1 overflow-hidden">
        {mobileView === 'categories' && (
          <div className="flex flex-col h-full bg-white dark:bg-gray-900">
            <div className="p-4 border-b border-gray-200 dark:border-gray-800">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Catégories</h2>
                <button
                  onClick={() => setShowNewCategory(true)}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <Plus size={20} className="text-gray-600 dark:text-gray-300" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {loading.categories ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
                </div>
              ) : categories.length > 0 ? (
                categories.map((category) => (
                  <div
                    key={category.id}
                    onClick={() => handleCategorySelect(category)}
                    className={`p-4 border-b border-gray-100 dark:border-gray-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${selectedCategory?.id === category.id ? 'bg-gray-50 dark:bg-gray-800' : ''}`}
                  >
                    <h3 className="font-medium text-gray-900 dark:text-white">{category.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {category.topics_count} sujets
                    </p>
                    <div className="flex items-center mt-2 text-xs text-gray-400">
                      <Clock size={12} className="mr-1" />
                      <span>Dernière activité: {formatTimeAgo(category.last_activity)}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                  <p>Aucune catégorie trouvée</p>
                </div>
              )}
            </div>
          </div>
        )}

        {mobileView === 'topics' && selectedCategory && (
          <TopicsListView 
            selectedCategory={selectedCategory}
            topics={topics}
            loading={loading}
            setShowNewTopic={setShowNewTopic}
            handleTopicSelect={handleTopicSelect}
            formatTimeAgo={formatTimeAgo}
            isMobile={true}
            onBack={handleBackToCategories}
          />
        )}

        {mobileView === 'posts' && selectedTopic && (
          <TopicPostsView 
            selectedTopic={selectedTopic}
            posts={posts}
            loading={loading}
            newPostContent={newPostContent}
            setNewPostContent={setNewPostContent}
            showEmojiPicker={showEmojiPicker}
            setShowEmojiPicker={setShowEmojiPicker}
            emojiPickerRef={emojiPickerRef}
            createPost={createPost}
            formatTimeAgo={formatTimeAgo}
            isMobile={true}
            onBack={handleBackToTopics}
          />
        )}
      </div>

      {/* Modals */}
      {showNewCategory && (
        <NewCategoryModal
          newCategory={newCategory}
          setNewCategory={setNewCategory}
          setShowNewCategory={setShowNewCategory}
          createCategory={createCategory}
        />
      )}

      {showNewTopic && selectedCategory && (
        <NewTopicModal
          newTopic={newTopic}
          setNewTopic={setNewTopic}
          setShowNewTopic={setShowNewTopic}
          createTopic={createTopic}
          loading={loading}
        />
      )}
    </div>
  );
}

// Sub-components for better organization
const TopicsListView = ({
  selectedCategory,
  topics,
  loading,
  setShowNewTopic,
  handleTopicSelect,
  formatTimeAgo,
  isMobile = false,
  onBack
}: {
  selectedCategory: Category;
  topics: Topic[];
  loading: any;
  setShowNewTopic: (show: boolean) => void;
  handleTopicSelect: (topic: Topic) => void;
  formatTimeAgo: (timestamp: string) => string;
  isMobile?: boolean;
  onBack?: () => void;
}) => {
  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {isMobile && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center">
          <button
            onClick={onBack}
            className="mr-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ArrowLeft size={20} className="text-gray-600 dark:text-gray-300" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              {selectedCategory.name}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {selectedCategory.description}
            </p>
          </div>
        </div>
      )}

      {!isMobile && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              {selectedCategory.name}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {selectedCategory.description}
            </p>
          </div>
          <button
            onClick={() => setShowNewTopic(true)}
            className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 flex items-center space-x-2"
          >
            <Plus size={16} />
            <span>Nouveau sujet</span>
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {loading.topics ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
          </div>
        ) : topics.length > 0 ? (
          <div className="divide-y divide-gray-200 dark:divide-gray-800">
            {topics.map((topic) => (
              <div
                key={topic.id}
                onClick={() => handleTopicSelect(topic)}
                className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {topic.title}
                    </h3>
                    <div className="flex items-center mt-1 text-sm text-gray-500 dark:text-gray-400">
                      <span>Par @{topic.author.username}</span>
                      <span className="mx-2">•</span>
                      <span>{formatTimeAgo(topic.created_at)}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <MessageCircle size={14} className="mr-1" />
                      <span>{topic.posts_count}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Eye size={14} className="mr-1" />
                      <span>{topic.views_count}</span>
                    </div>
                  </div>
                </div>
                {topic.last_post && (
                  <div className="mt-2 flex items-center text-xs text-gray-400">
                    <span>Dernière réponse par @{topic.last_post.author.username}</span>
                    <span className="mx-2">•</span>
                    <span>{formatTimeAgo(topic.last_post.created_at)}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <MessageCircle size={48} className="text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
              Aucun sujet trouvé
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Soyez le premier à créer un sujet dans cette catégorie
            </p>
            <button
              onClick={() => setShowNewTopic(true)}
              className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 flex items-center space-x-2"
            >
              <Plus size={16} />
              <span>Créer un sujet</span>
            </button>
          </div>
        )}
      </div>

      {isMobile && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={() => setShowNewTopic(true)}
            className="w-full px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 flex items-center justify-center space-x-2"
          >
            <Plus size={16} />
            <span>Nouveau sujet</span>
          </button>
        </div>
      )}
    </div>
  );
};

const TopicPostsView = ({
  selectedTopic,
  posts,
  loading,
  newPostContent,
  setNewPostContent,
  showEmojiPicker,
  setShowEmojiPicker,
  emojiPickerRef,
  createPost,
  formatTimeAgo,
  isMobile = false,
  onBack
}: {
  selectedTopic: Topic;
  posts: Post[];
  loading: any;
  newPostContent: string;
  setNewPostContent: (content: string) => void;
  showEmojiPicker: boolean;
  setShowEmojiPicker: (show: boolean) => void;
  emojiPickerRef: React.RefObject<HTMLDivElement>;
  createPost: () => void;
  formatTimeAgo: (timestamp: string) => string;
  isMobile?: boolean;
  onBack?: () => void;
}) => {
  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {isMobile && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center">
          <button
            onClick={onBack}
            className="mr-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ArrowLeft size={20} className="text-gray-600 dark:text-gray-300" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              {selectedTopic.title}
            </h1>
            <div className="flex items-center mt-1 text-sm text-gray-500 dark:text-gray-400">
              <span>Créé par @{selectedTopic.author.username}</span>
              <span className="mx-2">•</span>
              <span>{formatTimeAgo(selectedTopic.created_at)}</span>
              <span className="mx-2">•</span>
              <span>{selectedTopic.views_count} vues</span>
            </div>
          </div>
        </div>
      )}

      {!isMobile && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              {selectedTopic.title}
            </h1>
            <div className="flex items-center mt-1 text-sm text-gray-500 dark:text-gray-400">
              <span>Créé par @{selectedTopic.author.username}</span>
              <span className="mx-2">•</span>
              <span>{formatTimeAgo(selectedTopic.created_at)}</span>
              <span className="mx-2">•</span>
              <span>{selectedTopic.views_count} vues</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {selectedTopic.is_pinned && (
              <span className="px-2 py-1 text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 rounded-full flex items-center">
                <Pin size={12} className="mr-1" />
                Épinglé
              </span>
            )}
            {selectedTopic.is_locked && (
              <span className="px-2 py-1 text-xs bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 rounded-full flex items-center">
                <Lock size={12} className="mr-1" />
                Verrouillé
              </span>
            )}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {loading.posts ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
          </div>
        ) : posts.length > 0 ? (
          posts.map((post) => (
            <div key={post.id} className="flex space-x-4 group">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <User size={20} />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {post.author.username}
                    </span>
                    <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                      {formatTimeAgo(post.created_at)}
                    </span>
                    {post.is_edited && (
                      <span className="ml-2 text-xs text-gray-400">
                        (modifié)
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                      <MessageCircle size={16} className="text-gray-500" />
                    </button>
                    <button className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                      <ThumbsUp size={16} className="text-gray-500" />
                    </button>
                    <button className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                      <MoreVertical size={16} className="text-gray-500" />
                    </button>
                  </div>
                </div>
                <div className="mt-1 text-gray-700 dark:text-gray-300">
                  {post.content}
                </div>
                <div className="mt-2 flex items-center space-x-4 text-sm">
                  <button className="flex items-center text-gray-500 hover:text-emerald-500">
                    <ThumbsUp size={14} className="mr-1" />
                    <span>{post.likes_count} J'aime</span>
                  </button>
                  <button className="flex items-center text-gray-500 hover:text-emerald-500">
                    <MessageCircle size={14} className="mr-1" />
                    <span>Répondre</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400">
            <MessageCircle size={48} className="mb-4 opacity-20" />
            <p>Aucun message dans ce sujet</p>
            <p className="text-sm mt-2">Soyez le premier à participer à la discussion</p>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="relative">
          <textarea
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            placeholder="Écrivez votre réponse..."
            rows={3}
            className="w-full px-4 py-3 pr-12 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
          />
          <div className="absolute right-3 bottom-3 flex space-x-2">
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
            >
              <Smile size={20} />
            </button>
            <button
              type="button"
              className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
            >
              <Paperclip size={20} />
            </button>
            <button
              type="button"
              onClick={createPost}
              disabled={!newPostContent.trim() || loading.posting}
              className="px-4 py-1.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading.posting ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mx-2"></div>
              ) : (
                'Publier'
              )}
            </button>
          </div>
          {showEmojiPicker && (
            <div
              ref={emojiPickerRef}
              className="absolute bottom-14 right-0 z-10"
            >
              <EmojiPicker
                onEmojiClick={(emojiData) => {
                  setNewPostContent(newPostContent + emojiData.emoji);
                }}
                width={300}
                height={350}
                previewConfig={{ showPreview: false }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const EmptyForumView = ({ setShowNewCategory }: { setShowNewCategory: (show: boolean) => void }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <Hash size={48} className="text-gray-300 dark:text-gray-600 mb-4" />
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
        Bienvenue sur le forum
      </h3>
      <p className="text-gray-500 dark:text-gray-400 max-w-md mb-6">
        Sélectionnez une catégorie pour voir les sujets de discussion ou créez-en une nouvelle pour commencer.
      </p>
      <button
        onClick={() => setShowNewCategory(true)}
        className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 flex items-center space-x-2"
      >
        <Plus size={16} />
        <span>Nouvelle catégorie</span>
      </button>
    </div>
  );
};

const NewCategoryModal = ({
  newCategory,
  setNewCategory,
  setShowNewCategory,
  createCategory
}: {
  newCategory: { name: string; description: string };
  setNewCategory: (category: { name: string; description: string }) => void;
  setShowNewCategory: (show: boolean) => void;
  createCategory: () => void;
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">Nouvelle catégorie</h3>
          <button
            onClick={() => {
              setShowNewCategory(false);
              setNewCategory({ name: '', description: '' });
            }}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
          >
            <X size={20} />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nom de la catégorie
            </label>
            <input
              type="text"
              value={newCategory.name}
              onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="Ex: Questions générales"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={newCategory.description}
              onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="Décrivez le thème de cette catégorie"
            />
          </div>
          <div className="flex justify-end space-x-3 pt-2">
            <button
              onClick={() => {
                setShowNewCategory(false);
                setNewCategory({ name: '', description: '' });
              }}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Annuler
            </button>
            <button
              onClick={createCategory}
              disabled={!newCategory.name.trim()}
              className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              Créer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const NewTopicModal = ({
  newTopic,
  setNewTopic,
  setShowNewTopic,
  createTopic,
  loading
}: {
  newTopic: { title: string; content: string };
  setNewTopic: (topic: { title: string; content: string }) => void;
  setShowNewTopic: (show: boolean) => void;
  createTopic: () => void;
  loading: any;
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">Nouveau sujet</h3>
          <button
            onClick={() => {
              setShowNewTopic(false);
              setNewTopic({ title: '', content: '' });
            }}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
          >
            <X size={20} />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Titre du sujet
            </label>
            <input
              type="text"
              value={newTopic.title}
              onChange={(e) => setNewTopic({ ...newTopic, title: e.target.value })}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="Donnez un titre clair à votre sujet"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Votre message
            </label>
            <textarea
              value={newTopic.content}
              onChange={(e) => setNewTopic({ ...newTopic, content: e.target.value })}
              rows={8}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="Développez votre question ou votre idée ici..."
            />
          </div>
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center space-x-2">
              <button
                type="button"
                className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <Paperclip size={20} />
              </button>
              <button
                type="button"
                className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <Image size={20} />
              </button>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowNewTopic(false);
                  setNewTopic({ title: '', content: '' });
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Annuler
              </button>
              <button
                onClick={createTopic}
                disabled={!newTopic.title.trim() || !newTopic.content.trim()}
                className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                {loading.posting ? 'Publication...' : 'Publier le sujet'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};