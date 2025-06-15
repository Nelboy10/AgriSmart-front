'use client';

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Send, Search, MoreVertical, Phone, Video, Paperclip, Smile, Users, MessageCircle, Plus } from 'lucide-react';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface User {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  avatar?: string;
  is_online?: boolean;
  last_seen?: string;
}

interface ChatThread {
  id: string;
  participants: User[];
  last_message?: Message;
  created_at: string;
  updated_at: string;
  is_group?: boolean;
  name?: string;
  unread_count?: number;
}

interface Message {
  id: string;
  content: string;
  sender: User;
  thread: string;
  created_at: string;
  is_read: boolean;
  message_type: 'text' | 'image' | 'file';
  file_url?: string;
}

export default function ChatPage() {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedThread, setSelectedThread] = useState<ChatThread | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchUser();
    fetchThreads();
    fetchOnlineUsers();
  }, []);

  useEffect(() => {
    if (selectedThread) {
      fetchMessages(selectedThread.id);
    }
  }, [selectedThread]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

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

  const fetchThreads = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${apiUrl}/api/chat/threads/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setThreads(response.data.results || []);
    } catch (error) {
      console.error('Erreur lors de la récupération des conversations:', error);
    }
  };

  const fetchMessages = async (threadId: string) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${apiUrl}/api/chat/messages/?thread=${threadId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(response.data.results || []);
    } catch (error) {
      console.error('Erreur lors de la récupération des messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOnlineUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${apiUrl}/api/auth/users/?is_online=true`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOnlineUsers(response.data.results || []);
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs en ligne:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedThread) return;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${apiUrl}/api/chat/messages/`, {
        content: newMessage,
        thread: selectedThread.id
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMessages(prev => [...prev, response.data]);
      setNewMessage('');
      fetchThreads(); // Refresh threads to update last message
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
    }
  };

  const createNewThread = async (participantId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${apiUrl}/api/chat/threads/`, {
        participants: [participantId]
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setThreads(prev => [response.data, ...prev]);
      setSelectedThread(response.data);
      setShowNewChatModal(false);
    } catch (error) {
      console.error('Erreur lors de la création de la conversation:', error);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'À l\'instant';
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes}min`;
    if (diffInMinutes < 1440) return `Il y a ${Math.floor(diffInMinutes / 60)}h`;
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getThreadName = (thread: ChatThread) => {
    if (thread.is_group && thread.name) return thread.name;
    const otherParticipant = thread.participants.find(p => p.id !== user?.id);
    return otherParticipant ? `${otherParticipant.first_name} ${otherParticipant.last_name}` : 'Conversation';
  };

  const getThreadAvatar = (thread: ChatThread) => {
    if (thread.is_group) return '👥';
    const otherParticipant = thread.participants.find(p => p.id !== user?.id);
    return otherParticipant ? getInitials(otherParticipant.first_name, otherParticipant.last_name) : '?';
  };

  const filteredThreads = threads.filter(thread =>
    getThreadName(thread).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredOnlineUsers = onlineUsers.filter(onlineUser =>
    `${onlineUser.first_name} ${onlineUser.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) &&
    onlineUser.id !== user?.id
  );

  return (
    <div className="h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex">
      {/* Sidebar */}
      <div className="w-80 bg-white/80 backdrop-blur-xl border-r border-green-200/50 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-green-100/50">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Messages
            </h1>
            <button
              onClick={() => setShowNewChatModal(true)}
              className="p-2 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl hover:from-green-600 hover:to-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher une conversation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/70 backdrop-blur-sm"
            />
          </div>
        </div>

        {/* Online Users */}
        {onlineUsers.length > 0 && (
          <div className="p-4 border-b border-green-100/50">
            <h3 className="text-sm font-medium text-gray-600 mb-3 flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              En ligne ({onlineUsers.length})
            </h3>
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {onlineUsers.slice(0, 8).map((onlineUser) => (
                <button
                  key={onlineUser.id}
                  onClick={() => createNewThread(onlineUser.id)}
                  className="flex-shrink-0 flex flex-col items-center space-y-1 p-2 hover:bg-green-50 rounded-lg transition-colors"
                >
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                      {getInitials(onlineUser.first_name, onlineUser.last_name)}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>
                  <span className="text-xs text-gray-600 max-w-16 truncate">
                    {onlineUser.first_name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-2">
            {filteredThreads.map((thread) => (
              <div
                key={thread.id}
                onClick={() => setSelectedThread(thread)}
                className={`p-4 rounded-xl cursor-pointer transition-all duration-200 mb-2 ${
                  selectedThread?.id === thread.id
                    ? 'bg-gradient-to-r from-green-100 to-blue-100 shadow-md'
                    : 'hover:bg-white/60 hover:shadow-sm'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    {thread.is_group ? (
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-lg">
                        👥
                      </div>
                    ) : (
                      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                        {getThreadAvatar(thread)}
                      </div>
                    )}
                    {thread.unread_count && thread.unread_count > 0 && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {thread.unread_count > 9 ? '9+' : thread.unread_count}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900 truncate">
                        {getThreadName(thread)}
                      </h3>
                      <span className="text-xs text-gray-500">
                        {thread.last_message && formatTime(thread.last_message.created_at)}
                      </span>
                    </div>
                    
                    {thread.last_message && (
                      <p className="text-sm text-gray-600 truncate mt-1">
                        {thread.last_message.sender.id === user?.id ? 'Vous: ' : ''}
                        {thread.last_message.content}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedThread ? (
          <>
            {/* Chat Header */}
            <div className="bg-white/80 backdrop-blur-xl border-b border-green-200/50 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                    {getThreadAvatar(selectedThread)}
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900">{getThreadName(selectedThread)}</h2>
                    <p className="text-sm text-gray-500">
                      {selectedThread.is_group 
                        ? `${selectedThread.participants.length} participants`
                        : 'En ligne'
                      }
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button className="p-2 hover:bg-green-100 rounded-lg transition-colors">
                    <Phone className="w-5 h-5 text-gray-600" />
                  </button>
                  <button className="p-2 hover:bg-green-100 rounded-lg transition-colors">
                    <Video className="w-5 h-5 text-gray-600" />
                  </button>
                  <button className="p-2 hover:bg-green-100 rounded-lg transition-colors">
                    <MoreVertical className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {loading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender.id === user?.id ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                        message.sender.id === user?.id
                          ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white'
                          : 'bg-white/80 backdrop-blur-sm text-gray-900 border border-green-100/50'
                      }`}
                    >
                      {message.sender.id !== user?.id && (
                        <div className="text-xs font-medium mb-1 text-green-600">
                          {message.sender.first_name} {message.sender.last_name}
                        </div>
                      )}
                      <p className="text-sm leading-relaxed">{message.content}</p>
                      <div
                        className={`text-xs mt-2 ${
                          message.sender.id === user?.id
                            ? 'text-green-100'
                            : 'text-gray-500'
                        }`}
                      >
                        {formatTime(message.created_at)}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="bg-white/80 backdrop-blur-xl border-t border-green-200/50 p-4">
              <div className="flex items-center space-x-3">
                <button className="p-2 hover:bg-green-100 rounded-lg transition-colors">
                  <Paperclip className="w-5 h-5 text-gray-600" />
                </button>
                
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Tapez votre message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/70 backdrop-blur-sm"
                  />
                </div>
                
                <button className="p-2 hover:bg-green-100 rounded-lg transition-colors">
                  <Smile className="w-5 h-5 text-gray-600" />
                </button>
                
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="p-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-2xl hover:from-green-600 hover:to-blue-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          /* No Chat Selected */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <MessageCircle className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Bienvenue sur AgriSmart Chat
              </h2>
              <p className="text-gray-600 mb-6 max-w-md">
                Sélectionnez une conversation pour commencer à échanger avec vos contacts ou créez une nouvelle discussion.
              </p>
              <button
                onClick={() => setShowNewChatModal(true)}
                className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-8 py-3 rounded-2xl hover:from-green-600 hover:to-blue-600 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
              >
                Nouvelle conversation
              </button>
            </div>
          </div>
        )}
      </div>

      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
            <h3 className="text-xl font-bold mb-4">Nouvelle conversation</h3>
            
            <div className="relative mb-4">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un contact..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div className="max-h-64 overflow-y-auto space-y-2">
              {filteredOnlineUsers.map((contact) => (
                <button
                  key={contact.id}
                  onClick={() => createNewThread(contact.id)}
                  className="w-full flex items-center space-x-3 p-3 hover:bg-green-50 rounded-xl transition-colors text-left"
                >
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                    {getInitials(contact.first_name, contact.last_name)}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {contact.first_name} {contact.last_name}
                    </div>
                    <div className="text-sm text-gray-500">@{contact.username}</div>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowNewChatModal(false)}
                className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}