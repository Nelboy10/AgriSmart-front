'use client'

import { useEffect, useState } from 'react'
import { useAuthStore, useAuthInitialization } from '@/stores/auth-store'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { toast } from 'sonner'
import { MessageCircle, Send, Plus, Clock, User } from 'lucide-react'

interface Author {
  id: number
  username: string
  photo?: string
}

interface Post {
  id: number
  content: string
  created_at: string
  author: Author | string
  comments: Comment[]
}

interface Comment {
  id: number
  content: string
  created_at: string
  author: Author | string
  post: number
}

function safeFormatDate(dateString?: string): string {
  if (!dateString || isNaN(Date.parse(dateString))) {
    return 'Date inconnue'
  }
  return format(new Date(dateString), 'PPpp', { locale: fr })
}

function getAuthorInfo(author: Author | string | undefined): { username: string; photo?: string } {
  if (!author) return { username: 'Utilisateur' }
  if (typeof author === 'object' && author.username) {
    return { username: author.username, photo: author.photo }
  }
  if (typeof author === 'string') return { username: author }
  return { username: 'Utilisateur' }
}

export default function CommunityFeed() {
  useAuthInitialization()
  const [posts, setPosts] = useState<Post[]>([])
  const [newPostContent, setNewPostContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [isSubmittingPost, setIsSubmittingPost] = useState(false)
  const { token, isAuthenticated, user, logout } = useAuthStore()

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
      const postsWithComments = data.map((post: Post) => ({
        ...post,
        comments: Array.isArray(post.comments) ? post.comments : []
      }))
      setPosts(postsWithComments)
    } catch (err: any) {
      console.error('Erreur fetchPosts:', err)
      toast.error(err?.message ?? 'Erreur inconnue')
    } finally {
      setLoading(false)
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
      const commentWithAuthor = {
        ...newComment,
        author: user || newComment.author
      }

      setPosts(posts.map(post =>
        post.id === postId
          ? {
              ...post,
              comments: Array.isArray(post.comments)
                ? [commentWithAuthor, ...post.comments]
                : [commentWithAuthor]
            }
          : post
      ))
      toast.success('Commentaire ajouté avec succès.')
    } catch (err: any) {
      console.error('Erreur lors de l\'ajout du commentaire:', err)
      toast.error(err?.message ?? "Erreur lors de l'ajout du commentaire")
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium">Chargement des posts...</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Formulaire de création de post */}
      {isAuthenticated && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 transition-all hover:shadow-md">
          <div className="flex items-start gap-4">
            <Avatar className="ring-2 ring-slate-100">
              <AvatarImage src={user?.photo || ''} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                {user?.username?.charAt(0).toUpperCase() || <User className="w-4 h-4" />}
              </AvatarFallback>
            </Avatar>
            <form onSubmit={handlePostSubmit} className="flex-1 space-y-4">
              <Textarea
                placeholder="Partagez quelque chose avec la communauté..."
                aria-label="Zone de texte pour publier un post"
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                rows={3}
                className="min-h-[100px] border-slate-200 focus:border-blue-400 focus:ring-blue-400/20 resize-none text-slate-700 placeholder:text-slate-400"
              />
              <div className="flex justify-between items-center">
                <div className="flex items-center text-xs text-slate-400 gap-1">
                  <Plus className="w-3 h-3" />
                  <span>Ajoutez votre contenu</span>
                </div>
                <Button 
                  type="submit" 
                  disabled={!newPostContent.trim() || isSubmittingPost}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-full font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-700 mb-2">Aucun post pour le moment</h3>
          <p className="text-slate-500">Soyez le premier à partager quelque chose avec la communauté !</p>
        </div>
      ) : (
        posts.map((post) => {
          const authorInfo = getAuthorInfo(post.author)
          return (
            <article key={post.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
              {/* En-tête du post */}
              <div className="p-6 pb-4">
                <div className="flex items-start gap-4">
                  <Avatar className="ring-2 ring-slate-100">
                    <AvatarImage src={authorInfo.photo || ''} />
                    <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-semibold">
                      {authorInfo.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-slate-900 truncate">{authorInfo.username}</h3>
                      <div className="flex items-center gap-1 text-slate-400">
                        <Clock className="w-3 h-3" />
                        <span className="text-xs font-medium">
                          {safeFormatDate(post.created_at)}
                        </span>
                      </div>
                    </div>
                    <p className="text-slate-700 leading-relaxed whitespace-pre-line">{post.content}</p>
                  </div>
                </div>
              </div>

              {/* Section commentaires */}
              <div className="border-t border-slate-100">
                {post.comments?.length > 0 && (
                  <div className="px-6 py-4 bg-slate-50/50">
                    <div className="flex items-center gap-2 mb-4">
                      <MessageCircle className="w-4 h-4 text-slate-500" />
                      <span className="text-sm font-medium text-slate-600">
                        {post.comments.length} commentaire{post.comments.length > 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="space-y-4">
                      {post.comments.map((comment) => {
                        const commentAuthorInfo = getAuthorInfo(comment.author)
                        return (
                          <div key={comment.id} className="flex items-start gap-3">
                            <Avatar className="w-8 h-8 ring-1 ring-slate-200">
                              <AvatarImage src={commentAuthorInfo.photo || ''} />
                              <AvatarFallback className="bg-gradient-to-br from-amber-500 to-orange-600 text-white text-xs font-semibold">
                                {commentAuthorInfo.username.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="bg-white rounded-2xl px-4 py-3 border border-slate-200">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="text-sm font-semibold text-slate-900 truncate">{commentAuthorInfo.username}</h4>
                                  <div className="flex items-center gap-1 text-slate-400">
                                    <Clock className="w-3 h-3" />
                                    <span className="text-xs">
                                      {safeFormatDate(comment.created_at)}
                                    </span>
                                  </div>
                                </div>
                                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{comment.content}</p>
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
                  <div className="p-6 pt-4">
                    <CommentForm key={`form-${post.id}`} postId={post.id} onSubmit={handleCommentSubmit} />
                  </div>
                )}
              </div>
            </article>
          )
        })
      )}
    </div>
  )
}

function CommentForm({
  postId,
  onSubmit
}: {
  postId: number
  onSubmit: (postId: number, content: string) => void
}) {
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (content.trim()) {
      setIsSubmitting(true)
      await onSubmit(postId, content)
      setContent('')
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-3">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Ajouter un commentaire..."
        aria-label="Zone de commentaire"
        rows={1}
        className="flex-1 min-h-[44px] border-slate-200 focus:border-blue-400 focus:ring-blue-400/20 resize-none text-sm placeholder:text-slate-400"
      />
      <Button 
        type="submit" 
        size="sm" 
        disabled={!content.trim() || isSubmitting}
        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
      >
        {isSubmitting ? (
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <Send className="w-4 h-4" />
        )}
      </Button>
    </form>
  )
}