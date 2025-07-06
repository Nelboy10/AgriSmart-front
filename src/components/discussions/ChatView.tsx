'use client';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuthStore } from '@/stores/auth-store';
import Link from 'next/link';
import {
  MessageCircle, Plus, Search, ArrowLeft, Send, Paperclip,
  MoreVertical, User, Users, X, Check, Smile, Edit2, Trash2
} from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';

interface Thread {
  id: string;
  thread_type: 'private' | 'group';
  title?: string;
  participants: User[];
  last_message: {
    content: string;
    created_at: string;
    sender: { username: string };
  };
  unread_count: number;
  updated_at: string;
}

interface Message {
  id: string;
  content: string;
  sender: { id: string; username: string };
  timestamp: string;
  is_edited: boolean;
  message_type: 'text' | 'system' | 'file';
  seen_by: { id: string }[];
  file_url: string;
  file_type?: string;
}

interface User {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  photo: string;
  is_online: boolean;
}

const MessageOptions = ({ onEdit, onDelete, onCancel }: { onEdit: () => void; onDelete: () => void; onCancel: () => void }) => {
  return (
    <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 border border-gray-200 dark:border-gray-700">
      <button
        onClick={onEdit}
        className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        Modifier
      </button>
      <button
        onClick={onDelete}
        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        Supprimer
      </button>
      <button
        onClick={onCancel}
        className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        Annuler
      </button>
    </div>
  );
};

export default function ChatView() {
  const { token, user } = useAuthStore();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [showNewChat, setShowNewChat] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showOptions, setShowOptions] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);
  const [loading, setLoading] = useState({
    threads: false,
    messages: false,
    sending: false,
    searching: false
  });
  const [error, setError] = useState({
    threads: '',
    messages: '',
    sending: ''
  });
  const [mobileView, setMobileView] = useState<'threads' | 'chat'>('threads');
  const messagesEndRef = useRef<HTMLDivElement>(null!);
  const emojiPickerRef = useRef<HTMLDivElement>(null!);
  const [editingMessage, setEditingMessage] = useState<{id: string | null, content: string}>({id: null, content: ''});
  const [editContent, setEditContent] = useState('');

  // Gestion responsive
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        if (selectedThread) {
          setMobileView('chat');
        } else {
          setMobileView('threads');
        }
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [selectedThread]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchThreads = async () => {
    setLoading(prev => ({ ...prev, threads: true }));
    setError(prev => ({ ...prev, threads: '' }));
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/threads/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setThreads(res.data);
    } catch (err) {
      setError(prev => ({ ...prev, threads: 'Erreur lors du chargement des conversations' }));
    } finally {
      setLoading(prev => ({ ...prev, threads: false }));
    }
  };

  const fetchMessages = async (threadId: string) => {
    setLoading(prev => ({ ...prev, messages: true }));
    setError(prev => ({ ...prev, messages: '' }));

    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/messages/?thread=${threadId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const sortedMessages = [...res.data].sort((a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );

      setMessages(sortedMessages);

      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/messages/mark_thread_as_seen/`, {
        thread_id: threadId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

    } catch (err) {
      setError(prev => ({ ...prev, messages: 'Erreur lors du chargement des messages' }));
    } finally {
      setLoading(prev => ({ ...prev, messages: false }));
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedThread) return;

    setLoading(prev => ({ ...prev, sending: true }));
    setError(prev => ({ ...prev, sending: '' }));

    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/messages/`, {
        content: newMessage,
        thread_id: selectedThread.id
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setNewMessage('');
      fetchMessages(selectedThread.id);
    } catch (err) {
      setError(prev => ({ ...prev, sending: 'Erreur lors de l\'envoi du message' }));
    } finally {
      setLoading(prev => ({ ...prev, sending: false }));
    }
  };

  const handleEditMessage = async () => {
    if (!editingMessage.id || !editContent.trim() || !selectedThread) return;

    try {
      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/chat/messages/${editingMessage.id}/edit_message/`,
        { content: editContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessages(messages.map(msg =>
        msg.id === editingMessage.id
          ? { ...msg, content: editContent, is_edited: true }
          : msg
      ));

      setEditingMessage({id: null, content: ''});
      setEditContent('');
    } catch (error) {
      console.error('Erreur lors de la modification du message:', error);
    }
  };

  const handleDeleteMessage = async () => {
    if (!messageToDelete) return;

    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/chat/messages/${messageToDelete}/delete_message/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessages(messages.filter(msg => msg.id !== messageToDelete));
      setShowDeleteDialog(false);
      setMessageToDelete(null);
    } catch (error) {
      console.error('Erreur lors de la suppression du message:', error);
    }
  };

  const startEditing = (message: Message) => {
    setEditingMessage({id: message.id, content: message.content});
    setEditContent(message.content);
    setShowOptions(null);
  };

  const cancelEditing = () => {
    setEditingMessage({id: null, content: ''});
    setEditContent('');
  };

  const searchUsers = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setLoading(prev => ({ ...prev, searching: true }));
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/search/users/?q=${query}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSearchResults(res.data.users);
    } catch (err) {
      console.error('Error searching users:', err);
    } finally {
      setLoading(prev => ({ ...prev, searching: false }));
    }
  };

  const startPrivateChat = async (userId: string) => {
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/threads/start_private_chat/`, {
        user_id: userId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSelectedThread(res.data);
      setShowNewChat(false);
      setUserSearchQuery('');
      setSearchResults([]);
      if (window.innerWidth < 768) {
        setMobileView('chat');
      }
      fetchThreads();
    } catch (err) {
      console.error('Error starting private chat:', err);
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    if (!timestamp) return 'À l\'instant';

    try {
      const now = new Date();
      const time = new Date(timestamp);
      if (isNaN(time.getTime())) return 'À l\'instant';

      const diff = now.getTime() - time.getTime();
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(diff / 3600000);
      const days = Math.floor(diff / 86400000);

      if (minutes < 1) return 'À l\'instant';
      if (minutes < 60) return `${minutes}min`;
      if (hours < 24) return `${hours}h`;
      return `${days}j`;
    } catch (error) {
      console.error('Erreur de formatage de la date:', error);
      return 'À l\'instant';
    }
  };

  const handleBackToThreads = () => {
    setSelectedThread(null);
    setMobileView('threads');
  };

  useEffect(() => {
    fetchThreads();
  }, [token]);

  useEffect(() => {
    if (selectedThread) {
      fetchMessages(selectedThread.id);
    }
  }, [selectedThread, token]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const timer = setTimeout(() => {
      searchUsers(userSearchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [userSearchQuery]);

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile Navigation Header */}
      <div className="md:hidden flex items-center p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        {mobileView === 'chat' && (
          <button
            onClick={handleBackToThreads}
            className="mr-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ArrowLeft size={20} className="text-gray-600 dark:text-gray-300" />
          </button>
        )}
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
          {mobileView === 'threads' ? '' : selectedThread?.thread_type === 'group' 
            ? selectedThread.title 
            : selectedThread?.participants.find(p => p.username !== user?.username)?.username}
        </h2>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex flex-1 overflow-hidden">
        {/* Threads List */}
        <ThreadsListView 
          threads={threads}
          loading={loading}
          error={error}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          setShowNewChat={setShowNewChat}
          selectedThread={selectedThread}
          setSelectedThread={setSelectedThread}
          user={user}
          formatTimeAgo={formatTimeAgo}
        />

        {/* Chat View */}
        <div className="flex-1 flex flex-col">
          {selectedThread ? (
            <ChatDetailView
              selectedThread={selectedThread}
              messages={messages}
              loading={loading}
              error={error}
              newMessage={newMessage}
              setNewMessage={setNewMessage}
              sendMessage={sendMessage}
              showEmojiPicker={showEmojiPicker}
              setShowEmojiPicker={setShowEmojiPicker}
              emojiPickerRef={emojiPickerRef}
              editingMessage={editingMessage}
              editContent={editContent}
              setEditContent={setEditContent}
              handleEditMessage={handleEditMessage}
              cancelEditing={cancelEditing}
              showOptions={showOptions}
              setShowOptions={setShowOptions}
              startEditing={startEditing}
              setMessageToDelete={setMessageToDelete}
              setShowDeleteDialog={setShowDeleteDialog}
              user={user}
              formatTimeAgo={formatTimeAgo}
            />
          ) : (
            <EmptyChatView />
          )}
        </div>
      </div>

      {/* Mobile Views */}
      <div className="md:hidden flex-1 overflow-hidden">
        {mobileView === 'threads' && (
          <ThreadsListView 
            threads={threads}
            loading={loading}
            error={error}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            setShowNewChat={setShowNewChat}
            selectedThread={selectedThread}
            setSelectedThread={(thread) => {
              setSelectedThread(thread);
              setMobileView('chat');
            }}
            user={user}
            formatTimeAgo={formatTimeAgo}
            isMobile={true}
          />
        )}

        {mobileView === 'chat' && selectedThread && (
          <ChatDetailView
            selectedThread={selectedThread}
            messages={messages}
            loading={loading}
            error={error}
            newMessage={newMessage}
            setNewMessage={setNewMessage}
            sendMessage={sendMessage}
            showEmojiPicker={showEmojiPicker}
            setShowEmojiPicker={setShowEmojiPicker}
            emojiPickerRef={emojiPickerRef}
            editingMessage={editingMessage}
            editContent={editContent}
            setEditContent={setEditContent}
            handleEditMessage={handleEditMessage}
            cancelEditing={cancelEditing}
            showOptions={showOptions}
            setShowOptions={setShowOptions}
            startEditing={startEditing}
            setMessageToDelete={setMessageToDelete}
            setShowDeleteDialog={setShowDeleteDialog}
            user={user}
            formatTimeAgo={formatTimeAgo}
            isMobile={true}
            onBack={handleBackToThreads}
          />
        )}
      </div>

      {/* Modals */}
      {showNewChat && (
        <NewChatModal
          userSearchQuery={userSearchQuery}
          setUserSearchQuery={setUserSearchQuery}
          searchResults={searchResults}
          loading={loading}
          startPrivateChat={startPrivateChat}
          setShowNewChat={setShowNewChat}
        />
      )}

      {showDeleteDialog && (
        <DeleteDialog
          showDeleteDialog={showDeleteDialog}
          setShowDeleteDialog={setShowDeleteDialog}
          handleDeleteMessage={handleDeleteMessage}
          setMessageToDelete={setMessageToDelete}
        />
      )}
    </div>
  );
}

// Sub-components
const ThreadsListView = ({
  threads,
  loading,
  error,
  searchQuery,
  setSearchQuery,
  setShowNewChat,
  selectedThread,
  setSelectedThread,
  user,
  formatTimeAgo,
  isMobile = false
}: {
  threads: Thread[];
  loading: any;
  error: any;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  setShowNewChat: (show: boolean) => void;
  selectedThread: Thread | null;
  setSelectedThread: (thread: Thread) => void;
  user: any;
  formatTimeAgo: (timestamp: string) => string;
  isMobile?: boolean;
}) => {
  return (
    <div className="w-full md:w-80 border-r border-gray-200 dark:border-gray-800 flex flex-col h-full bg-white dark:bg-gray-900">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 ">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Messages</h2>
            <button
              onClick={() => setShowNewChat(true)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Plus size={20} className="text-gray-600 dark:text-gray-300" />
            </button>
          </div>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
            />
          </div>
        </div>
      

      <div className="flex-1 overflow-y-auto">
        {loading.threads && (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
          </div>
        )}

        {error.threads && (
          <div className="bg-red-100 dark:bg-red-900/10 text-red-600 dark:text-red-400 p-4 rounded-lg m-4">
            {error.threads}
          </div>
        )}

        {!loading.threads && !error.threads && (
          <>
            {threads.length > 0 ? (
              threads
                .filter(thread =>
                  thread.participants.some(p =>
                    p.username !== user?.username &&
                    p.username.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                )
                .map(thread => {
                  const otherUser = thread.participants.find(p => p.username !== user?.username);
                  return (
                    <div
                      key={thread.id}
                      onClick={() => setSelectedThread(thread)}
                      className={`p-4 border-b border-gray-200 dark:border-gray-800 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors relative
                        ${selectedThread?.id === thread.id ? 'bg-gray-100 dark:bg-gray-800' : ''}
                        ${thread.unread_count > 0 ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
                      `}
                    >
                      {thread.unread_count > 0 && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 rounded-r"></div>
                      )}
                      <div className="flex items-start gap-3">
                        <div className="relative">
                          {thread.thread_type === 'group' ? (
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 rounded-full">
                              <Users size={20} />
                            </div>
                          ) : (
                            <div className="relative w-12 h-12">
                              {otherUser?.photo ? (
                                <img 
                                  src={otherUser.photo}
                                  alt="Photo de profil"
                                  className="w-full h-full rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-emerald-500 rounded-full flex items-center justify-center text-white text-lg">
                                  {otherUser?.username?.charAt(0) || '?'}
                                </div>
                              )}
                              {otherUser?.is_online && (
                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between mb-1">
                            <h3 className="font-semibold truncate">
                              {thread.thread_type === 'group'
                                ? thread.title
                                : otherUser?.username}
                            </h3>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {formatTimeAgo(thread.updated_at)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            {thread.last_message ? (
                              thread.last_message.sender ? (
                                `${thread.last_message.sender.username}: ${thread.last_message.content}`
                              ) : (
                                `Message: ${thread.last_message.content}`
                              )
                            ) : 'Aucun message'}
                          </p>
                          {thread.unread_count > 0 && (
                            <div className="flex justify-end mt-1">
                              <span className="bg-emerald-500 text-white text-xs rounded-full px-2 py-0.5">
                                {thread.unread_count}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <MessageCircle size={48} className="text-gray-400 dark:text-gray-600 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Aucune conversation</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  Vous n'avez pas encore de conversation. Cliquez sur le bouton <Plus size={16} className="inline" /> pour en démarrer une nouvelle.
                </p>
                <button
                  onClick={() => setShowNewChat(true)}
                  className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 inline-flex items-center gap-2"
                >
                  <Plus size={16} />
                  <span>Nouvelle conversation</span>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const ChatDetailView = ({
  selectedThread,
  messages,
  loading,
  error,
  newMessage,
  setNewMessage,
  sendMessage,
  showEmojiPicker,
  setShowEmojiPicker,
  emojiPickerRef,
  editingMessage,
  editContent,
  setEditContent,
  handleEditMessage,
  cancelEditing,
  showOptions,
  setShowOptions,
  startEditing,
  setMessageToDelete,
  setShowDeleteDialog,
  user,
  formatTimeAgo,
  isMobile = false,
  onBack
}: {
  selectedThread: Thread;
  messages: Message[];
  loading: any;
  error: any;
  newMessage: string;
  setNewMessage: (message: string) => void;
  sendMessage: () => void;
  showEmojiPicker: boolean;
  setShowEmojiPicker: (show: boolean) => void;
  emojiPickerRef: React.RefObject<HTMLDivElement>;
  editingMessage: {id: string | null, content: string};
  editContent: string;
  setEditContent: (content: string) => void;
  handleEditMessage: () => void;
  cancelEditing: () => void;
  showOptions: string | null;
  setShowOptions: (id: string | null) => void;
  startEditing: (message: Message) => void;
  setMessageToDelete: (id: string) => void;
  setShowDeleteDialog: (show: boolean) => void;
  user: any;
  formatTimeAgo: (timestamp: string) => string;
  isMobile?: boolean;
  onBack?: () => void;
}) => {
  const otherUser = selectedThread?.participants?.find(p => p.username !== user?.username) || null;
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log('Selected thread updated:', selectedThread);
    console.log('Other user:', otherUser);
  }, [selectedThread, otherUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {isMobile && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ArrowLeft size={20} className="text-gray-600 dark:text-gray-300" />
          </button>
          <div className="relative">
            {selectedThread.thread_type === 'group' ? (
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 rounded-full">
                <Users size={20} />
              </div>
            ) : (
              <div className="relative w-10 h-10">
                {otherUser?.photo ? (
                  <img 
                    src={otherUser.photo}
                    alt="Photo de profil"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-emerald-500 rounded-full flex items-center justify-center text-white text-lg">
                    {otherUser?.username?.charAt(0) || '?'}
                  </div>
                )}
                {otherUser?.is_online && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                )}
              </div>
            )}
          </div>
          <div>
            <h3 className="font-semibold">
              {selectedThread.thread_type === 'group'
                ? selectedThread.title
                : otherUser?.username}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {selectedThread.thread_type === 'group'
                ? `${selectedThread.participants.length} membres`
                : otherUser?.is_online
                  ? 'En ligne'
                  : 'Hors ligne'}
            </p>
          </div>
        </div>
      )}

      {!isMobile && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              {selectedThread.thread_type === 'group' ? (
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 rounded-full">
                  <Users size={20} />
                </div>
              ) : (
                <div className="relative w-10 h-10">
                  {otherUser?.photo ? (
                    <img 
                      src={otherUser.photo}
                      alt="Photo de profil"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-emerald-500 rounded-full flex items-center justify-center text-white text-lg">
                      {otherUser?.username?.charAt(0) || '?'}
                    </div>
                  )}
                  {otherUser?.is_online && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                  )}
                </div>
              )}
            </div>
            <div>
              <h3 className="font-semibold">
                {selectedThread.thread_type === 'group'
                  ? selectedThread.title
                  : otherUser?.username}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {selectedThread.thread_type === 'group'
                  ? `${selectedThread.participants.length} membres`
                  : otherUser?.is_online
                    ? 'En ligne'
                    : 'Hors ligne'}
              </p>
            </div>
          </div>
          <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
            <MoreVertical size={20} className="text-gray-600 dark:text-gray-300" />
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading.messages && (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
          </div>
        )}

        {error.messages && (
          <div className="bg-red-100 dark:bg-red-900/10 text-red-600 dark:text-red-400 p-4 rounded-lg">
            {error.messages}
          </div>
        )}

        {!loading.messages && !error.messages && (
          <>
            {messages.map(message => (
              <div
                key={message.id}
                className={`flex ${message.sender.username === user?.username ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-2 max-w-xs lg:max-w-md ${message.sender.username === user?.username ? 'flex-row-reverse' : ''}`}>
                  {message.message_type !== 'system' && (
                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 flex items-center justify-center text-sm">
                      {message.sender.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className={`rounded-2xl px-4 py-2 ${
                    message.sender.username === user?.username
                      ? 'bg-emerald-500 text-white'
                      : message.message_type === 'system'
                        ? 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-sm italic'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                  }`}>
                    {message.message_type !== 'system' && (
                      <p className="text-xs font-medium mb-1">
                        {message.sender.username === user?.username ? 'Vous' : message.sender.username}
                      </p>
                    )}
                    {editingMessage.id === message.id ? (
                      <div>
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          rows={3}
                        />
                        <div className="flex justify-end gap-2 mt-2">
                          <button
                            onClick={handleEditMessage}
                            className="px-3 py-1 bg-emerald-500 text-white rounded hover:bg-emerald-600 text-sm"
                          >
                            Sauvegarder
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600 text-sm"
                          >
                            Annuler
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="whitespace-pre-line">{message.content}</p>
                    )}
                    <div className="flex items-center justify-end gap-2 mt-1">
                      {message.is_edited && (
                        <span className="text-xs italic text-gray-500 dark:text-gray-400">modifié</span>
                      )}
                      <span className={`text-xs ${
                        message.sender.username === user?.username
                          ? 'text-emerald-200'
                          : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {formatTimeAgo(message.timestamp)}
                      </span>
                      {message.sender.username === user?.username && (
                        <span className={`text-xs ${
                          message.seen_by?.length > 0
                            ? 'text-emerald-200'
                            : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          {message.seen_by?.length > 0 ? 'Vu' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                  {message.sender.username === user?.username && (
                    <div className="relative">
                      <button
                        onClick={() => setShowOptions(showOptions === message.id ? null : message.id)}
                        className="p-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
                      >
                        <MoreVertical size={16} />
                      </button>
                      {showOptions === message.id && (
                        <MessageOptions
                          onEdit={() => startEditing(message)}
                          onDelete={() => {
                            setMessageToDelete(message.id);
                            setShowDeleteDialog(true);
                          }}
                          onCancel={() => setShowOptions(null)}
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="flex items-end gap-2">
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <Smile size={20} />
          </button>
          <div className="flex-1 relative">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Écrivez votre message..."
              rows={1}
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
            />
            {showEmojiPicker && (
              <div ref={emojiPickerRef} className="absolute bottom-14 left-0 z-10">
                <EmojiPicker
                  onEmojiClick={(emojiData) => {
                    setNewMessage(newMessage + emojiData.emoji);
                  }}
                  width={300}
                  height={350}
                  previewConfig={{ showPreview: false }}
                />
              </div>
            )}
          </div>
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim() || loading.sending}
            className="p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading.sending ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
            ) : (
              <Send size={20} />
            )}
          </button>
        </div>
        {error.sending && (
          <div className="mt-2 text-sm text-red-500 dark:text-red-400">{error.sending}</div>
        )}
      </div>
    </div>
  );
};

const EmptyChatView = () => {
  return (
    <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center p-8">
        <MessageCircle size={48} className="text-gray-400 dark:text-gray-600 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Sélectionnez une conversation</h3>
        <p className="text-gray-500 dark:text-gray-400">Choisissez une conversation existante ou créez-en une nouvelle</p>
      </div>
    </div>
  );
};

const NewChatModal = ({
  userSearchQuery,
  setUserSearchQuery,
  searchResults,
  loading,
  startPrivateChat,
  setShowNewChat
}: {
  userSearchQuery: string;
  setUserSearchQuery: (query: string) => void;
  searchResults: User[];
  loading: any;
  startPrivateChat: (userId: string) => void;
  setShowNewChat: (show: boolean) => void;
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Nouvelle conversation</h2>
          <button
            onClick={() => {
              setShowNewChat(false);
              setUserSearchQuery('');
            }}
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <X size={20} />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Rechercher un utilisateur
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
              <input
                type="text"
                placeholder="Nom d'utilisateur..."
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="max-h-60 overflow-y-auto">
            {loading.searching ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-emerald-500"></div>
              </div>
            ) : searchResults.map(user => (
              <div
                key={user.id}
                onClick={() => startPrivateChat(user.id)}
                className="flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-lg cursor-pointer transition-colors"
              >
                <div className="relative">
                  {user.photo ? (
                    <img 
                      src={user.photo}
                      alt="Photo de profil"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white text-lg">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                  {user.is_online && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">@{user.username}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {user.first_name} {user.last_name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const DeleteDialog = ({
  showDeleteDialog,
  setShowDeleteDialog,
  handleDeleteMessage,
  setMessageToDelete
}: {
  showDeleteDialog: boolean;
  setShowDeleteDialog: (show: boolean) => void;
  handleDeleteMessage: () => void;
  setMessageToDelete: (id: string | null) => void;
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 max-w-sm w-full">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Supprimer le message</h3>
        <p className="mb-6 text-gray-700 dark:text-gray-300">Êtes-vous sûr de vouloir supprimer ce message ?</p>
        <div className="flex justify-end gap-2">
          <button
            onClick={() => {
              setShowDeleteDialog(false);
              setMessageToDelete(null);
            }}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Annuler
          </button>
          <button
            onClick={handleDeleteMessage}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
};