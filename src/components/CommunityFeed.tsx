'use client'

import { useEffect, useState } from 'react'
import { useAuthStore, useAuthInitialization } from '@/stores/auth-store'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { toast } from 'sonner'
import { MessageCircle, Send, Plus, Clock, User, Heart, Share2, MoreHorizontal } from 'lucide-react'

interface Author {
  id: number
  username: string
  photo?: string
}

interface Post {
  id: number
  content: string
  created_at: string
  author: Author
  comments_count: number
  likes_count: number
  is_liked: boolean
}

interface Comment {
  id: number
  content: string
  created_at: string
  author: Author
  post: number
}

function safeFormatDate(dateString?: string): string {
  if (!dateString || isNaN(Date.parse(dateString))) {
    return 'Date inconnue'
  }
  return format(new Date(dateString), 'PPpp', { locale: fr })
}

function getAuthorInfo(author: Author | undefined): { username: string; photo?: string } {
  if (!author) return { username: 'Utilisateur' }
  return { username: author.username, photo: author.photo }
}

export default function CommunityFeed() {
  useAuthInitialization()
  const [posts, setPosts] = useState<Post[]>([])
  const [newPostContent, setNewPostContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [isSubmittingPost, setIsSubmittingPost] = useState(false)
  const [expandedPostId, setExpandedPostId] = useState<number | null>(null)
  const [postComments, setPostComments] = useState<Record<number, Comment[]>>({})
  const [commentsLoading, setCommentsLoading] = useState<Record<number, boolean>>({})
  const { token, isAuthenticated, user, logout } = useAuthStore()
  const [likedPosts, setLikedPosts] = useState<Record<number, boolean>>({})

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts/`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      })
      if (!res.ok) {
        if (res.status === 401) {
          logout()
          throw new Error('Session expirée. Veuillez vous reconnecter.')
        }
        throw new Error('Erreur lors du chargement des posts')
      }
      const data = await res.json()
      setPosts(data)
      
      // Initialiser l'état des likes
      const initialLikes = data.reduce((acc: Record<number, boolean>, post: Post) => {
        acc[post.id] = post.is_liked
        return acc
      }, {})
      setLikedPosts(initialLikes)
    } catch (err: any) {
      console.error('Erreur fetchPosts:', err)
      toast.error(err?.message ?? 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  const fetchComments = async (postId: number) => {
    try {
      setCommentsLoading(prev => ({ ...prev, [postId]: true }))
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts/${postId}/comments/`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      })
      if (!res.ok) {
        throw new Error('Erreur lors du chargement des commentaires')
      }
      const data = await res.json()
      setPostComments(prev => ({ ...prev, [postId]: data }))
    } catch (err: any) {
      console.error('Erreur fetchComments:', err)
      toast.error(err?.message ?? 'Erreur lors du chargement des commentaires')
    } finally {
      setCommentsLoading(prev => ({ ...prev, [postId]: false }))
    }
  }

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPostContent.trim() || !isAuthenticated || !token) {
      toast.error("Contenu invalide ou utilisateur non authentifié.")
      return
    }

    try {
      setIsSubmittingPost(true)
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: newPostContent })
      })

      if (!res.ok) {
        if (res.status === 401) {
          logout()
          throw new Error('Session expirée. Veuillez vous reconnecter.')
        }
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.message || `Erreur HTTP ${res.status}`)
      }

      const newPost = await res.json()
      setPosts([newPost, ...posts])
      setNewPostContent('')
      toast.success('Votre post a été publié.')
    } catch (err: any) {
      toast.error(err?.message ?? 'Erreur lors de la publication')
    } finally {
      setIsSubmittingPost(false)
    }
  }

  const handleLikePost = async (postId: number) => {
    if (!isAuthenticated || !token) {
      toast.error("Vous devez être connecté pour aimer un post.")
      return
    }

    // Vérifier si l'utilisateur a déjà liké ce post
    if (likedPosts[postId]) {
      toast.info("Vous avez déjà aimé ce post.")
      return
    }

    try {
      const post = posts.find(p => p.id === postId)
      const method = post?.is_liked ? 'DELETE' : 'POST'
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts/${postId}/like/`, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!res.ok) {
        throw new Error(`Erreur HTTP ${res.status}`)
      }

      setPosts(posts.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              is_liked: !post.is_liked,
              likes_count: post.is_liked ? post.likes_count - 1 : post.likes_count + 1
            } 
          : post
      ))
      
      // Mettre à jour l'état local des likes
      setLikedPosts(prev => ({
        ...prev,
        [postId]: !prev[postId]
      }))
    } catch (err: any) {
      toast.error(err?.message ?? "Erreur lors de la mise à jour du like")
    }
  }

  const handleCommentSubmit = async (postId: number, content: string) => {
    if (!content.trim() || !isAuthenticated || !token) {
      toast.error("Contenu vide ou utilisateur non authentifié.")
      return
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/comments/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content, post: postId })
      })

      if (!res.ok) {
        if (res.status === 401) {
          logout()
          throw new Error('Session expirée. Veuillez vous reconnecter.')
        }
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.message || `Erreur HTTP ${res.status}`)
      }

      const newComment = await res.json()
      
      // Mettre à jour les commentaires du post
      setPostComments(prev => ({
        ...prev,
        [postId]: [newComment, ...(prev[postId] || [])]
      }))
      
      // Mettre à jour le compteur de commentaires
      setPosts(posts.map(post => 
        post.id === postId
          ? { ...post, comments_count: post.comments_count + 1 }
          : post
      ))
      
      toast.success('Commentaire ajouté avec succès.')
    } catch (err: any) {
      console.error('Erreur lors de l\'ajout du commentaire:', err)
      toast.error(err?.message ?? "Erreur lors de l'ajout du commentaire")
    }
  }

  const toggleComments = async (postId: number) => {
    if (expandedPostId === postId) {
      setExpandedPostId(null)
    } else {
      setExpandedPostId(postId)
      if (!postComments[postId]) {
        await fetchComments(postId)
      }
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <div className="w-10 h-10 border-4 border-blue-100 dark:border-blue-900 border-t-blue-600 dark:border-t-blue-500 rounded-full animate-spin"></div>
        <p className="text-slate-500 dark:text-slate-400 font-medium">Chargement des posts...</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 px-4 sm:px-0">
      {/* Formulaire de création de post */}
      {isAuthenticated && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm p-5 transition-all hover:shadow-md dark:hover:shadow-slate-700/50">
          <div className="flex items-start gap-3">
            <Avatar className="h-10 w-10 ring-2 ring-blue-100 dark:ring-blue-900">
              <AvatarImage src={user?.photo || ''} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                {user?.username?.charAt(0).toUpperCase() || <User className="w-4 h-4" />}
              </AvatarFallback>
            </Avatar>
            <form onSubmit={handlePostSubmit} className="flex-1 space-y-3">
              <Textarea
                placeholder="Partagez quelque chose avec la communauté..."
                aria-label="Zone de texte pour publier un post"
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                rows={3}
                className="min-h-[100px] border-slate-200 dark:border-slate-700 focus:border-blue-400 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/50 resize-none text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm dark:bg-slate-800/90"
              />
              <div className="flex justify-between items-center">
                <div className="flex items-center text-xs text-slate-400 dark:text-slate-500 gap-1">
                  <Plus className="w-3 h-3" />
                  <span>Ajoutez votre contenu</span>
                </div>
                <Button 
                  type="submit" 
                  disabled={!newPostContent.trim() || isSubmittingPost}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-5 py-1.5 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  {isSubmittingPost ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Publication...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Publier
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Liste des posts */}
      {posts.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-8 text-center">
          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-6 h-6 text-blue-500 dark:text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">Aucun post pour le moment</h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            {isAuthenticated 
              ? "Soyez le premier à partager quelque chose avec la communauté !" 
              : "Connectez-vous pour voir et partager des posts avec la communauté."}
          </p>
        </div>
      ) : (
        posts.map((post) => {
          const authorInfo = getAuthorInfo(post.author)
          const comments = postComments[post.id] || []
          const isLoadingComments = commentsLoading[post.id]
          const isExpanded = expandedPostId === post.id

          return (
            <article key={post.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md dark:hover:shadow-slate-700/50 transition-all duration-200 overflow-hidden">
              {/* En-tête du post */}
              <div className="p-5">
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10 ring-2 ring-slate-100 dark:ring-slate-700">
                    <AvatarImage src={authorInfo.photo || ''} />
                    <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-semibold">
                      {authorInfo.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-3 mb-1">
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100 truncate">{authorInfo.username}</h3>
                      <button className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 p-1 rounded-full">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 mb-2">
                      <Clock className="w-3 h-3" />
                      <span>{safeFormatDate(post.created_at)}</span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line text-sm">{post.content}</p>
                  </div>
                </div>

                {/* Actions du post */}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 dark:border-slate-700">
                  <button 
                    onClick={() => handleLikePost(post.id)}
                    className={`flex items-center gap-1 text-sm ${post.is_liked ? 'text-rose-500' : 'text-slate-500 dark:text-slate-400 hover:text-rose-500 dark:hover:text-rose-400'}`}
                  >
                    <Heart className={`w-4 h-4 ${post.is_liked ? 'fill-current' : ''}`} />
                    <span>{post.likes_count}</span>
                  </button>
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => toggleComments(post.id)}
                      className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400 hover:text-blue-500 dark:hover:text-blue-400"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>{post.comments_count}</span>
                    </button>
                    <button className="text-slate-500 dark:text-slate-400 hover:text-blue-500 dark:hover:text-blue-400">
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Section commentaires */}
              {isExpanded && (
                <div className="border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                  {isLoadingComments ? (
                    <div className="flex justify-center p-4">
                      <div className="w-6 h-6 border-2 border-blue-100 dark:border-blue-900 border-t-blue-600 dark:border-t-blue-500 rounded-full animate-spin"></div>
                    </div>
                  ) : (
                    <>
                      {comments.length > 0 && (
                        <div className="px-5 py-3">
                          <div className="space-y-3">
                            {comments.map((comment) => {
                              const commentAuthorInfo = getAuthorInfo(comment.author)
                              return (
                                <div key={comment.id} className="flex items-start gap-3">
                                  <Avatar className="w-8 h-8 ring-1 ring-slate-200 dark:ring-slate-600">
                                    <AvatarImage src={commentAuthorInfo.photo || ''} />
                                    <AvatarFallback className="bg-gradient-to-br from-amber-500 to-orange-600 text-white text-xs font-semibold">
                                      {commentAuthorInfo.username.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1 min-w-0">
                                    <div className="bg-white dark:bg-slate-700 rounded-lg px-3 py-2 border border-slate-200 dark:border-slate-600 shadow-xs">
                                      <div className="flex items-center gap-2 mb-1">
                                        <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">{commentAuthorInfo.username}</h4>
                                        <div className="flex items-center gap-1 text-slate-400 dark:text-slate-400">
                                          <Clock className="w-3 h-3" />
                                          <span className="text-xs">
                                            {safeFormatDate(comment.created_at).split(' ')[0]}
                                          </span>
                                        </div>
                                      </div>
                                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">{comment.content}</p>
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}

                      {/* Formulaire de commentaire */}
                      {isAuthenticated && (
                        <div className="p-4">
                          <form 
                            onSubmit={(e) => {
                              e.preventDefault()
                              const form = e.currentTarget
                              const content = (form.elements.namedItem('comment') as HTMLTextAreaElement).value
                              handleCommentSubmit(post.id, content)
                              form.reset()
                            }}
                            className="flex gap-2 items-end"
                          >
                            <Textarea
                              name="comment"
                              placeholder="Ajouter un commentaire..."
                              aria-label="Zone de commentaire"
                              rows={1}
                              className="flex-1 min-h-[40px] border-slate-200 dark:border-slate-700 focus:border-blue-400 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/50 resize-none text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 dark:bg-slate-800/90 dark:text-slate-200"
                            />
                            <Button 
                              type="submit" 
                              size="sm" 
                              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-3 py-1.5 rounded-lg font-medium transition-all h-[40px] shadow-sm"
                            >
                              <Send className="w-4 h-4" />
                            </Button>
                          </form>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </article>
          )
        })
      )}
    </div>
  )
}