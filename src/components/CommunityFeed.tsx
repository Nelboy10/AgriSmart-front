'use client'

import { useEffect, useState } from 'react'
import { useAuthStore, useAuthInitialization } from '@/stores/auth-store'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { toast } from 'sonner'

interface Post {
  id: number
  content: string
  created_at: string
  author: {
    id: number
    username: string
    photo?: string
  }
  comments: Comment[]
}

interface Comment {
  id: number
  content: string
  created_at: string
  author: {
    id: number
    username: string
    photo?: string
  }
}

// ✅ Utilitaire pour formater la date de façon sécurisée
function safeFormatDate(dateString?: string): string {
  if (!dateString || isNaN(Date.parse(dateString))) {
    return 'Date inconnue'
  }
  return format(new Date(dateString), 'PPpp', { locale: fr })
}

export default function CommunityFeed() {
  useAuthInitialization()
  const [posts, setPosts] = useState<Post[]>([])
  const [newPostContent, setNewPostContent] = useState('')
  const [loading, setLoading] = useState(true)
  const { token, isAuthenticated, user, logout } = useAuthStore()

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts/`, {
        headers: { Authorization: token ? `Bearer ${token}` : '' }
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
    } catch (err: any) {
      toast.error(err?.message ?? 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPostContent.trim()) return

    if (!isAuthenticated || !token) {
      toast.error('Vous devez être connecté pour publier')
      return
    }

    try {
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
    }
  }

  const handleCommentSubmit = async (postId: number, content: string) => {
    if (!content.trim()) return

    if (!isAuthenticated || !token) {
      toast.error('Vous devez être connecté pour commenter')
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
        throw new Error('Erreur lors de l’ajout du commentaire')
      }

      const newComment = await res.json()
      setPosts(posts.map(post =>
        post.id === postId
          ? { ...post, comments: [newComment, ...post.comments] }
          : post
      ))
    } catch (err: any) {
      toast.error(err?.message ?? 'Erreur lors de l’ajout du commentaire')
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
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            rows={3}
          />
          <div className="flex justify-end">
            <Button type="submit" disabled={!newPostContent.trim()}>
              Publier
            </Button>
          </div>
        </form>
      )}

      {posts.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Aucun post pour le moment. Soyez le premier à partager !
        </div>
      ) : (
        posts.map((post) => (
          <div key={post.id} className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Avatar>
                <AvatarImage src={post.author?.photo || ''} />
                <AvatarFallback>
                  {post.author?.username?.charAt(0)?.toUpperCase() ?? 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{post.author?.username ?? 'Utilisateur inconnu'}</h3>
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
                  {post.comments.map((comment) => (
                    <div key={`${comment.id}-${post.id}`} className="flex items-start gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={comment.author?.photo || ''} />
                        <AvatarFallback>
                          {comment.author?.username?.charAt(0)?.toUpperCase() ?? 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-medium">
                            {comment.author?.username ?? 'Utilisateur'}
                          </h4>
                          <span className="text-xs text-gray-500">
                            {safeFormatDate(comment.created_at)}
                          </span>
                        </div>
                        <p className="text-sm mt-1 whitespace-pre-line">
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {isAuthenticated && (
                <CommentForm
                  postId={post.id}
                  onSubmit={handleCommentSubmit}
                />
              )}
            </div>
          </div>
        ))
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (content.trim()) {
      onSubmit(postId, content)
      setContent('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Ajouter un commentaire..."
        rows={1}
        className="flex-1"
      />
      <Button type="submit" size="sm" disabled={!content.trim()}>
        Envoyer
      </Button>
    </form>
  )
}
