'use client'

import { useEffect, useState } from 'react'
import { useAuthStore, useAuthInitialization } from '@/stores/auth-store'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { toast } from 'sonner'
import { MessageCircle, Send, Image as ImageIcon, ThumbsUp, Smile, Share2, MoreHorizontal, User } from 'lucide-react'

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
      
      setPostComments(prev => ({
        ...prev,
        [postId]: [newComment, ...(prev[postId] || [])]
      }))
      
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
      <div className="flex flex-col items-center justify-center py-16 space-y-4 bg-gray-100 dark:bg-gray-900 min-h-screen">
        <div className="w-10 h-10 border-4 border-blue-100 dark:border-blue-900 border-t-blue-600 dark:border-t-blue-500 rounded-full animate-spin"></div>
        <p className="text-gray-500 dark:text-gray-400 font-medium">Chargement des posts...</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto bg-gray-100 dark:bg-gray-900 min-h-screen pb-10">
      {/* Header style Facebook */}
      <div className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10 p-4">
        <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">Community</h1>
      </div>

      {/* Post creation form - Facebook style */}
      {isAuthenticated && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-4 p-4 mx-4 mt-4">
          <div className="flex items-center gap-3 mb-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user?.photo || ''} />
              <AvatarFallback className="bg-blue-500 text-white font-semibold">
                {user?.username?.charAt(0).toUpperCase() || <User className="w-4 h-4" />}
              </AvatarFallback>
            </Avatar>
            <form onSubmit={handlePostSubmit} className="flex-1">
              <Textarea
                placeholder="Quoi de neuf ?"
                aria-label="Zone de texte pour publier un post"
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                rows={3}
                className="w-full rounded-2xl bg-gray-100 dark:bg-gray-700 border-none focus:ring-2 focus:ring-blue-500 resize-none text-gray-800 dark:text-gray-200 placeholder-gray-500"
              />
              <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex space-x-2">
                  <Button variant="ghost" className="text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700">
                    <ImageIcon className="w-5 h-5 text-green-500" />
                    <span className="ml-1">Photo</span>
                  </Button>
                  <Button variant="ghost" className="text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700">
                    <Smile className="w-5 h-5 text-yellow-500" />
                    <span className="ml-1">Émotion</span>
                  </Button>
                </div>
                <Button 
                  type="submit" 
                  disabled={!newPostContent.trim() || isSubmittingPost}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded-md font-medium disabled:opacity-50"
                >
                  {isSubmittingPost ? 'Publication...' : 'Publier'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Posts list */}
      {posts.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow mx-4 p-8 text-center">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-8 h-8 text-blue-500 dark:text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Aucun post pour le moment</h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            {isAuthenticated 
              ? "Soyez le premier à partager quelque chose !" 
              : "Connectez-vous pour voir et partager des posts."}
          </p>
        </div>
      ) : (
        posts.map((post) => {
          const authorInfo = getAuthorInfo(post.author)
          const comments = postComments[post.id] || []
          const isLoadingComments = commentsLoading[post.id]
          const isExpanded = expandedPostId === post.id

          return (
            <article key={post.id} className="bg-white dark:bg-gray-800 rounded-lg shadow mb-4 mx-4">
              {/* Post header */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={authorInfo.photo || ''} />
                      <AvatarFallback className="bg-gray-500 text-white">
                        {authorInfo.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">{authorInfo.username}</h3>
                      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                        <span>{safeFormatDate(post.created_at)}</span>
                        <span className="mx-1">·</span>
                        <span className="text-blue-500">Public</span>
                      </div>
                    </div>
                  </div>
                  <button className="text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-full">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>
                
                {/* Post content */}
                <p className="text-gray-800 dark:text-gray-200 mb-4 whitespace-pre-line">{post.content}</p>
                
                {/* Post stats */}
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 border-t border-b border-gray-200 dark:border-gray-700 py-2">
                  <div className="flex items-center">
                    <div className="bg-blue-500 text-white rounded-full p-1 flex items-center justify-center">
                      <ThumbsUp className="w-3 h-3" />
                    </div>
                    <span className="ml-1">{post.likes_count}</span>
                  </div>
                  <div>
                    <button 
                      onClick={() => toggleComments(post.id)}
                      className="hover:underline"
                    >
                      {post.comments_count} commentaire{post.comments_count !== 1 ? 's' : ''}
                    </button>
                  </div>
                </div>
                
                {/* Post actions */}
                <div className="flex justify-between mt-1">
                  <button 
                    onClick={() => handleLikePost(post.id)}
                    className={`flex-1 flex items-center justify-center py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 ${post.is_liked ? 'text-blue-500' : 'text-gray-500'}`}
                  >
                    <ThumbsUp className={`w-5 h-5 mr-1 ${post.is_liked ? 'fill-current' : ''}`} />
                    <span>J'aime</span>
                  </button>
                  <button 
                    onClick={() => toggleComments(post.id)}
                    className="flex-1 flex items-center justify-center py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
                  >
                    <MessageCircle className="w-5 h-5 mr-1" />
                    <span>Commenter</span>
                  </button>
                  <button className="flex-1 flex items-center justify-center py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500">
                    <Share2 className="w-5 h-5 mr-1" />
                    <span>Partager</span>
                  </button>
                </div>
              </div>

              {/* Comments section */}
              {isExpanded && (
                <div className="bg-gray-50 dark:bg-gray-700/30 border-t border-gray-200 dark:border-gray-700">
                  {isLoadingComments ? (
                    <div className="flex justify-center p-4">
                      <div className="w-6 h-6 border-2 border-blue-100 dark:border-blue-900 border-t-blue-500 rounded-full animate-spin"></div>
                    </div>
                  ) : (
                    <>
                      {comments.length > 0 && (
                        <div className="p-4 space-y-3">
                          {comments.map((comment) => {
                            const commentAuthorInfo = getAuthorInfo(comment.author)
                            return (
                              <div key={comment.id} className="flex items-start space-x-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={commentAuthorInfo.photo || ''} />
                                  <AvatarFallback className="bg-gray-500 text-white text-xs">
                                    {commentAuthorInfo.username.charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl p-3">
                                    <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100">{commentAuthorInfo.username}</h4>
                                    <p className="text-sm text-gray-800 dark:text-gray-200 mt-1">{comment.content}</p>
                                  </div>
                                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1 ml-3 space-x-3">
                                    <button className="hover:underline">J'aime</button>
                                    <span>{safeFormatDate(comment.created_at)}</span>
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}

                      {/* Comment form */}
                      {isAuthenticated && (
                        <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={user?.photo || ''} />
                              <AvatarFallback className="bg-blue-500 text-white text-xs">
                                {user?.username?.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <form 
                              onSubmit={(e) => {
                                e.preventDefault()
                                const form = e.currentTarget
                                const content = (form.elements.namedItem('comment') as HTMLTextAreaElement).value
                                handleCommentSubmit(post.id, content)
                                form.reset()
                              }}
                              className="flex-1 flex items-center"
                            >
                              <div className="flex-1 relative">
                                <Textarea
                                  name="comment"
                                  placeholder="Écrivez un commentaire..."
                                  aria-label="Zone de commentaire"
                                  rows={1}
                                  className="w-full rounded-2xl bg-gray-100 dark:bg-gray-700 border-none focus:ring-2 focus:ring-blue-500 resize-none text-gray-800 dark:text-gray-200 placeholder-gray-500 pr-10"
                                />
                                <button 
                                  type="button"
                                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                >
                                  <Smile className="w-5 h-5" />
                                </button>
                              </div>
                            </form>
                          </div>
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