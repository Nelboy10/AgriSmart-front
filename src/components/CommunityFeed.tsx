'use client'

import { useEffect, useState } from 'react'
import { useAuthStore, useAuthInitialization } from '@/stores/auth-store'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { toast } from 'sonner'

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
    return <div className="text-center py-8">Chargement des posts...</div>
  }

  return (
    <div className="space-y-6">
      {isAuthenticated && (
        <form onSubmit={handlePostSubmit} className="space-y-3">
          <Textarea
            placeholder="Partagez quelque chose avec la communauté..."
            aria-label="Zone de texte pour publier un post"
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            rows={3}
          />
          <div className="flex justify-end">
            <Button type="submit" disabled={!newPostContent.trim() || isSubmittingPost}>
              {isSubmittingPost ? 'Publication...' : 'Publier'}
            </Button>
          </div>
        </form>
      )}

      {posts.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Aucun post pour le moment. Soyez le premier à partager !
        </div>
      ) : (
        posts.map((post) => {
          const authorInfo = getAuthorInfo(post.author)
          return (
            <div key={post.id} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Avatar>
                  <AvatarImage src={authorInfo.photo || ''} />
                  <AvatarFallback>{authorInfo.username.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{authorInfo.username}</h3>
                    <span className="text-xs text-gray-500">
                      {safeFormatDate(post.created_at)}
                    </span>
                  </div>
                  <p className="mt-1 whitespace-pre-line">{post.content}</p>
                </div>
              </div>

              <div className="mt-4 pl-11 space-y-4">
                {post.comments?.length > 0 && (
                  <div className="space-y-3">
                    {post.comments.map((comment) => {
                      const commentAuthorInfo = getAuthorInfo(comment.author)
                      return (
                        <div key={comment.id} className="flex items-start gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={commentAuthorInfo.photo || ''} />
                            <AvatarFallback>{commentAuthorInfo.username.charAt(0).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-medium">{commentAuthorInfo.username}</h4>
                              <span className="text-xs text-gray-500">
                                {safeFormatDate(comment.created_at)}
                              </span>
                            </div>
                            <p className="text-sm mt-1 whitespace-pre-line">{comment.content}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {isAuthenticated && (
                  <CommentForm key={`form-${post.id}`} postId={post.id} onSubmit={handleCommentSubmit} />
                )}
              </div>
            </div>
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
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Ajouter un commentaire..."
        aria-label="Zone de commentaire"
        rows={1}
        className="flex-1"
      />
      <Button type="submit" size="sm" disabled={!content.trim() || isSubmitting}>
        {isSubmitting ? 'Envoi...' : 'Envoyer'}
      </Button>
    </form>
  )
}
