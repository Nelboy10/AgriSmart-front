'use client'
import { useEffect, useState } from 'react'

interface Post {
  id: number
  author: string
  content: string
}

interface Comment {
  id: number
  author: string
  content: string
}

export default function CommunityFeed() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [newPost, setNewPost] = useState('')
  const [posting, setPosting] = useState(false)
  const [comments, setComments] = useState<{ [postId: number]: Comment[] }>({})
  const [commentInputs, setCommentInputs] = useState<{ [postId: number]: string }>({})
  const [commentLoading, setCommentLoading] = useState<{ [postId: number]: boolean }>({})

  // Charger les posts
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts/`)
      .then(res => res.json())
      .then(data => setPosts(data.results || data))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false))
  }, [])

  // Charger les commentaires pour chaque post
  useEffect(() => {
    posts.forEach(post => {
      if (!comments[post.id]) {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/comments/?post=${post.id}`)
          .then(res => res.json())
          .then(data => setComments(prev => ({ ...prev, [post.id]: data.results || data })))
      }
    })
    // eslint-disable-next-line
  }, [posts])

  // Création d’un post
  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPost.trim()) return
    setPosting(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newPost }),
        credentials: 'include'
      })
      if (!res.ok) throw new Error('Erreur lors de la création du post')
      const post = await res.json()
      setPosts([post, ...posts])
      setNewPost('')
    } finally {
      setPosting(false)
    }
  }

  // Création d’un commentaire
  const handleComment = async (e: React.FormEvent, postId: number) => {
    e.preventDefault()
    const content = commentInputs[postId]
    if (!content?.trim()) return
    setCommentLoading(prev => ({ ...prev, [postId]: true }))
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/comments/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, post: postId }),
        credentials: 'include'
      })
      if (!res.ok) throw new Error('Erreur lors de l’ajout du commentaire')
      const comment = await res.json()
      setComments(prev => ({
        ...prev,
        [postId]: prev[postId] ? [...prev[postId], comment] : [comment]
      }))
      setCommentInputs(prev => ({ ...prev, [postId]: '' }))
    } finally {
      setCommentLoading(prev => ({ ...prev, [postId]: false }))
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow p-5 w-full max-w-2xl">
      <h2 className="text-lg font-bold mb-4 text-green-700">Communauté</h2>
      {/* Formulaire de post */}
      <form onSubmit={handlePost} className="flex gap-2 mb-6">
        <input
          className="flex-1 px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-green-400 outline-none"
          placeholder="Exprimez-vous…"
          value={newPost}
          onChange={e => setNewPost(e.target.value)}
          disabled={posting}
        />
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
          disabled={posting}
        >
          {posting ? 'Publication...' : 'Publier'}
        </button>
      </form>
      {/* Affichage des posts */}
      {loading ? (
        <div>Chargement…</div>
      ) : posts.length === 0 ? (
        <div className="text-gray-400">Aucun post pour l’instant.</div>
      ) : (
        <ul>
          {posts.map((post) => (
            <li key={post.id} className="mb-8 border-b pb-4">
              <div className="font-semibold mb-1">{post.author}</div>
              <div className="mb-2">{post.content}</div>
              {/* Affichage des commentaires */}
              <div className="ml-4">
                <div className="text-sm text-gray-500 mb-1">Commentaires :</div>
                <ul>
                  {(comments[post.id] || []).map(comment => (
                    <li key={comment.id} className="mb-1">
                      <span className="font-semibold">{comment.author} :</span> {comment.content}
                    </li>
                  ))}
                </ul>
                {/* Formulaire d’ajout de commentaire */}
                <form onSubmit={e => handleComment(e, post.id)} className="flex gap-2 mt-2">
                  <input
                    className="flex-1 px-2 py-1 rounded border border-gray-200 text-sm"
                    placeholder="Ajouter un commentaire…"
                    value={commentInputs[post.id] || ''}
                    onChange={e => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                    disabled={commentLoading[post.id]}
                  />
                  <button
                    type="submit"
                    className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                    disabled={commentLoading[post.id]}
                  >
                    {commentLoading[post.id] ? '...' : 'Envoyer'}
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}