'use client';
// Importation des modules et composants nécessaires
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuthStore } from '@/stores/auth-store';
import Link from 'next/link';
import {
  MessageCircle, Plus, Search, ArrowLeft, Send, Paperclip,
  MoreVertical, User, Users, X, Check, Smile, Edit2, Trash2
} from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';

// Définition des interfaces TypeScript pour les types de données utilisés
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
  message_type: 'text' | 'system';
  seen_by: { id: string }[];
}

interface User {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  photo: string;
  is_online: boolean;
}


// Composant pour afficher les options de modification et suppression des messages
const MessageOptions = ({ onEdit, onDelete, onCancel }: { onEdit: () => void; onDelete: () => void; onCancel: () => void }) => {
  return (
    <div className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg z-10">
      <button
        onClick={onEdit}
        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
      >
        Modifier
      </button>
      <button
        onClick={onDelete}
        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
      >
        Supprimer
      </button>
      <button
        onClick={onCancel}
        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
      >
        Annuler
      </button>
    </div>
  );
};

// Composant principal pour la vue de messagerie
export default function ChatView() {
  // Récupération du token et de l'utilisateur depuis le store d'authentification
  const { token, user } = useAuthStore();

  // États pour gérer les données et l'interface utilisateur
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

  // Références pour accéder aux éléments DOM
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const [editingMessage, setEditingMessage] = useState<{id: string | null, content: string}>({id: null, content: ''});
  const [editContent, setEditContent] = useState('');

  // Effet pour fermer les popups quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Threads: Récupération des threads de conversation
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

  // Messages: Récupération des messages d'un thread
  const fetchMessages = async (threadId: string) => {
    setLoading(prev => ({ ...prev, messages: true }));
    setError(prev => ({ ...prev, messages: '' }));

    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/messages/?thread=${threadId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const sortedMessages = [...res.data].sort((a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );

      setMessages(sortedMessages);

      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/messages/mark_thread_as_seen/`, {
        thread_id: threadId
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

    } catch (err:any) {
      console.error('Détails de l\'erreur:', {
        status: err.response?.status,
        data: err.response?.data,
        headers: err.config?.headers
      });
      setError(prev => ({ ...prev, messages: 'Erreur lors du chargement des messages' }));
    } finally {
      setLoading(prev => ({ ...prev, messages: false }));
    }
  };

  // Envoi de message
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedThread) return;

    setLoading(prev => ({ ...prev, sending: true }));
    setError(prev => ({ ...prev, sending: '' }));

    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/messages/`, {
        content: newMessage,
        thread_id: selectedThread.id
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setNewMessage('');
      fetchMessages(selectedThread.id);
    } catch (err) {
      console.error('Erreur détaillée:', (err as any).response?.data);
      setError(prev => ({ ...prev, sending: (err as any).response?.data?.message || 'Erreur lors de l\'envoi du message' }));
    } finally {
      setLoading(prev => ({ ...prev, sending: false }));
    }
  };

  // Modification de message
  const handleEditMessage = async () => {
    if (!editingMessage.id || !editContent.trim() || !selectedThread) return;

    try {
      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/chat/messages/${editingMessage.id}/edit_message/`,
        { content: editContent },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
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

  // Suppression de message
  const handleDeleteMessage = async () => {
    if (!messageToDelete) return;

    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/chat/messages/${messageToDelete}/delete_message/`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setMessages(messages.filter(msg => msg.id !== messageToDelete));
      setShowDeleteDialog(false);
      setMessageToDelete(null);

    } catch (error) {
      console.error('Erreur lors de la suppression du message:', error);
    }
  };

  // Fonction pour démarrer l'édition d'un message
  const startEditing = (message: Message) => {
    setEditingMessage({id: message.id, content: message.content});
    setEditContent(message.content);
    setShowOptions(null);
  };

  // Fonction pour annuler l'édition d'un message
  const cancelEditing = () => {
    setEditingMessage({id: null, content: ''});
    setEditContent('');
  };

  // Recherche d'utilisateurs
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

  // Démarrage d'une conversation privée
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
      fetchThreads();
    } catch (err) {
      console.error('Error starting private chat:', err);
    }
  };

  // Formatage du temps écoulé depuis un timestamp
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

  // Effet pour charger les threads au montage du composant
  useEffect(() => {
    fetchThreads();
  }, [token]);

  // Effet pour charger les messages lorsque le thread sélectionné change
  useEffect(() => {
    if (selectedThread) {
      fetchMessages(selectedThread.id);
    }
  }, [selectedThread, token]);

  // Effet pour faire défiler vers le bas lorsque les messages changent
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Effet pour rechercher des utilisateurs lorsque la requête de recherche change
  useEffect(() => {
    const timer = setTimeout(() => {
      searchUsers(userSearchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [userSearchQuery]);

  // Design: Rendu de l'interface utilisateur
  return (
    <div className="flex-1 flex bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/80 dark:to-gray-900">
      {/* Liste des threads - Toujours visible sur les grands écrans */}
      <div className={`w-full md:w-80 border-r border-border flex flex-col bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm ${selectedThread ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-border bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
          <div className="flex justify-between items-center mb-4 ">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Messages</h2>
            <button
              onClick={() => setShowNewChat(true)}
              className="p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Plus size={18} />
            </button>
          </div>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-900 dark:text-gray-50" size={18} />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/70 dark:bg-gray-900/70 border border-border/50 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary backdrop-blur-sm"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {loading.threads && (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
            </div>
          )}

          {error.threads && (
            <div className="bg-destructive/10 text-destructive p-4 rounded-lg m-4">
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
                        className={`p-4 border-b border-border hover:bg-accent/50 cursor-pointer transition-colors relative overflow-hidden
                          ${thread.unread_count > 0 ? 'bg-accent/20' : ''}
                        `}
                      >
                        {/* Indicateur de message non lu */}
                        {thread.unread_count > 0 && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
                        )}
                        <div className="flex items-start gap-3">
                          <div className="relative">
                            {thread.thread_type === 'group' ? (
                              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                                <Users size={20} />
                              </div>
                            ) : (
                              <div className="relative w-12 h-12">
                                {thread.participants?.find?.(p => p.username !== user?.username)?.photo ? (
                                  <Link href={`/profile/${thread.participants?.find?.(p => p.username !== user?.username)?.id}`} className="cursor-pointer">
                                    <img 
                                      src={thread.participants?.find?.(p => p.username !== user?.username)?.photo || ''}
                                      alt="Photo de profil"
                                      className="w-full h-full rounded-full object-cover"
                                    />
                                  </Link>
                                ) : (
                                  <Link href={`/profile/${thread.participants?.find?.(p => p.username !== user?.username)?.id}`} className="cursor-pointer">
                                    <div className="w-full h-full bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xl">
                                      {thread.participants?.find?.(p => p.username !== user?.username)?.username?.charAt(0) || '?'}
                                    </div>
                                  </Link>
                                )}
                              </div>
                            )}
                            {thread.participants?.some?.(p => p.is_online && p.id !== user?.username) && (
                              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-background rounded-full"></div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between mb-1">
                              <h3 className="font-semibold truncate">
                                {thread.thread_type === 'group'
                                  ? thread.title
                                  : otherUser?.username}
                              </h3>
                              <span className="text-xs text-muted-foreground">
                                {formatTimeAgo(thread.updated_at)}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground truncate">
                              {thread.last_message ? (
                                thread.last_message.sender ? (
                                  `${thread.last_message.sender.username}: ${thread.last_message.content}`
                                ) : (
                                  `Message: ${thread.last_message.content}`
                                )
                              ) : 'Aucun message'}
                            </p>
                            {thread.unread_count > 0 && (
                              <div className="flex justify-between items-center mt-2">
                                <span></span>
                                <span className="bg-primary text-primary-foreground text-xs rounded-full px-2 py-1">
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
                  <MessageCircle size={48} className="text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">Aucune conversation</h3>
                  <p className="text-muted-foreground mb-6">
                    Vous n'avez pas encore de conversation. Cliquez sur le bouton <Plus size={16} className="inline" /> pour en démarrer une nouvelle.
                  </p>
                  <button
                    onClick={() => setShowNewChat(true)}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 inline-flex items-center gap-2"
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

      {/* Vue de conversation ou vue vide */}
      <div className={`flex-1 flex flex-col ${!selectedThread ? 'hidden md:flex' : 'flex'}`}>
        {!selectedThread ? (
          <div className="flex-1 items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 hidden md:flex">
            <div className="text-center p-8">
              <MessageCircle size={48} className="text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-bold mb-2">Sélectionnez une conversation</h3>
              <p className="text-muted-foreground">Choisissez une conversation existante ou créez-en une nouvelle</p>
            </div>
          </div>
        ) : (
          <>
            {/* En-tête du chat */}
            <div className="p-4 border-b border-border bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedThread(null)}
                    className="md:hidden p-2 rounded-lg hover:bg-accent"
                  >
                    <ArrowLeft className="text-muted-foreground" size={20} />
                  </button>
                  <div className="relative">
                    {selectedThread.thread_type === 'group' ? (
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                        <Users size={20} />
                      </div>
                    ) : (
                      <div className="relative w-10 h-10">
                        {selectedThread?.participants?.find?.(p => p.username !== user?.username)?.photo ? (
                          <Link href={`/profile/${selectedThread?.participants?.find?.(p => p.username !== user?.username)?.id}`} className="cursor-pointer">
                            <img 
                              src={selectedThread.participants.find(p => p.username !== user?.username)?.photo || ''}
                              alt="Photo de profil"
                              className="w-full h-full rounded-full object-cover"
                            />
                          </Link>
                        ) : (
                          <Link href={`/profile/${selectedThread?.participants?.find?.(p => p.username !== user?.username)?.id}`} className="cursor-pointer">
                            <div className="w-full h-full bg-primary rounded-full flex items-center justify-center text-primary-foreground text-lg">
                              {selectedThread?.participants?.find?.(p => p.username !== user?.username)?.username?.charAt(0) || '?'}
                            </div>
                          </Link>
                        )}
                      </div>
                    )}
                    {selectedThread.participants?.some?.(p => p.is_online && p.username !== user?.username) && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-background rounded-full"></div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold">
                      {selectedThread.thread_type === 'group'
                        ? selectedThread.title
                        : selectedThread.participants?.find?.(p => p.username !== user?.username)?.username}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedThread.thread_type === 'group'
                        ? `${selectedThread.participants?.length} membres`
                        : selectedThread.participants?.some?.(p => p.is_online && p.username !== user?.username)
                          ? 'En ligne'
                          : 'Hors ligne'}
                    </p>
                  </div>
                </div>
                <button className="p-2 rounded-lg hover:bg-accent">
                  <MoreVertical className="text-muted-foreground" size={20} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-auto p-4 space-y-4 bg-white/80 dark:bg-gray-900/80">
              {loading.messages && (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
                </div>
              )}

              {error.messages && (
                <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
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
                          <Link href={`/profile/${message.sender.id}`} className="cursor-pointer">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm bg-secondary text-secondary-foreground">
                              {message.sender.username.charAt(0)}
                            </div>
                          </Link>
                        )}
                        <div className={`rounded-2xl px-4 py-2 ${
                          message.sender.username === user?.username
                            ? 'bg-primary text-primary-foreground'
                            : message.message_type === 'system'
                              ? 'bg-muted text-muted-foreground text-sm italic'
                              : 'bg-card text-foreground border border-border'
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
                                className="w-full bg-input border border-border rounded-lg px-2 py-1 focus:ring-2 focus:ring-primary/50 focus:border-primary"
                              />
                              <div className="flex justify-end gap-2 mt-2">
                                <button
                                  onClick={handleEditMessage}
                                  className="px-2 py-1 bg-primary text-primary-foreground rounded hover:bg-primary/90"
                                >
                                  Sauvegarder
                                </button>
                                <button
                                  onClick={cancelEditing}
                                  className="px-2 py-1 bg-destructive text-destructive-foreground rounded hover:bg-destructive/90"
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
                              <span className="text-xs italic">modifié</span>
                            )}
                            <span className={`text-xs ${
                              message.sender.username === user?.username
                                ? 'text-primary-foreground/70'
                                : 'text-muted-foreground'
                            }`}>
                              {formatTimeAgo(message.timestamp)}
                            </span>
                            {message.sender.username === user?.username && (
                              <span className={`text-xs ${
                                (message.seen_by?.length || 0) > 0
                                  ? 'text-primary-foreground/70'
                                  : 'text-muted-foreground'
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
                              className="p-1 text-muted-foreground hover:text-foreground rounded-lg hover:bg-accent"
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

            {/* Zone de saisie */}
            <div className="p-4 border-t border-border bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm">
              <div className="flex items-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-accent"
                >
                  <Smile size={20} />
                </button>
                <button className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-accent">
                  <Paperclip size={20} />
                </button>
                <div className="flex-1 relative">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Écrivez votre message..."
                    rows={1}
                    className="w-full bg-input border border-border rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary/50 focus:border-primary resize-none"
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
                          setNewMessage(prev => prev + emojiData.emoji);
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
                  className="p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading.sending ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-primary-foreground" />
                  ) : (
                    <Send size={20} />
                  )}
                </button>
              </div>
              {error.sending && (
                <div className="mt-2 text-sm text-destructive">{error.sending}</div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Nouveau chat: Modal */}
      {showNewChat && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-2xl p-6 border border-border/50 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Nouvelle conversation</h2>
              <button
                onClick={() => {
                  setShowNewChat(false);
                  setUserSearchQuery('');
                  setSearchResults([]);
                }}
                className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-accent"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Rechercher un utilisateur
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                  <input
                    type="text"
                    placeholder="Nom d'utilisateur..."
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  />
                </div>
              </div>
              <div className="max-h-60 overflow-y-auto">
                {loading.searching ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary" />
                  </div>
                ) : (
                  <div className="space-y-2">
                    {searchResults.map(user => (
                      <div
                        key={user.id}
                        onClick={() => startPrivateChat(user.id)}
                        className="flex items-center gap-3 p-3 hover:bg-accent/30 rounded-lg cursor-pointer"
                      >
                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground">
                          {user.photo ? <img src={user.photo} alt="Profile" className="rounded-full" /> : user.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium">@{user.username}</p>
                          <p className="text-sm text-muted-foreground">
                            {user.first_name} {user.last_name}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Boîte de dialogue de confirmation de suppression */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-2xl p-6 border border-border/50 max-w-sm w-full">
            <h3 className="text-lg font-bold mb-4">Supprimer le message</h3>
            <p className="mb-6">Êtes-vous sûr de vouloir supprimer ce message ?</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowDeleteDialog(false);
                  setMessageToDelete(null);
                }}
                className="px-4 py-2 bg-muted text-foreground rounded hover:bg-muted/80"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteMessage}
                className="px-4 py-2 bg-destructive text-destructive-foreground rounded hover:bg-destructive/90"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}