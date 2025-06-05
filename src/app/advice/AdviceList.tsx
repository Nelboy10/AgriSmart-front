'use client'
import { useEffect, useState } from 'react'

interface Content {
  id: number
  title: string
  description: string
  type: string
  category?: { id: number; name: string }
  language?: { id: number; name: string }
  video_url?: string
  video_file?: string
  thumbnail?: string
  author?: { id: number; username: string }
  created_at: string
}

export default function AdviceList() {
  const [advice, setAdvice] = useState<Content[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    setError('')
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/content/?is_validated=true&page=1`)
      .then(res => res.json())
      .then(data => {
        const items = data.results || data
        setAdvice(items)
      })
      .catch(() => setError("Erreur lors du chargement des conseils"))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="bg-white rounded-2xl shadow p-5 w-full">
      <h2 className="text-lg font-bold text-green-700 mb-4">Conseils agricoles</h2>
      {error && <div className="text-red-600">{error}</div>}
      {loading && <div>Chargement...</div>}

      <div className="overflow-x-auto">
        <ul className="flex gap-4 snap-x snap-mandatory overflow-x-auto pb-4">
          {advice.slice(0, 10).map(content => (
            <li
              key={content.id}
              className="snap-start min-w-[300px] max-w-[300px] bg-gray-50 rounded-lg p-4 shadow"
            >
              {content.type === 'video' ? (
                <>
                  {content.thumbnail ? (
                    <img
                      src={content.thumbnail}
                      alt={content.title}
                      className="rounded-lg w-full object-cover h-40 mb-2"
                    />
                  ) : (
                    <div className="bg-gray-200 w-full h-40 rounded-lg flex items-center justify-center text-gray-400 mb-2">Vidéo</div>
                  )}
                  {content.video_url || content.video_file ? (
                    <video
                      controls
                      src={content.video_file || content.video_url || undefined}
                      poster={content.thumbnail}
                      className="w-full rounded-lg mt-2"
                      style={{ maxHeight: 150 }}
                    />
                  ) : (
                    <div className="text-gray-500 text-sm">Vidéo non disponible</div>
                  )}
                </>
              ) : (
                <>
                  <h3 className="font-semibold text-green-800">{content.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {content.description.slice(0, 100)}{content.description.length > 100 ? '...' : ''}
                  </p>
                  <button className="text-green-600 text-sm font-semibold hover:underline">Lire plus</button>
                </>
              )}

              <div className="text-xs text-gray-400 mt-2">
                {content.category?.name && <span>{content.category.name} • </span>}
                {content.language?.name && <span>{content.language.name} • </span>}
                {content.author?.username && <span>Par {content.author.username} • </span>}
                {new Date(content.created_at).toLocaleDateString()}
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex justify-center mt-4">
        <button className="text-green-600 hover:underline font-semibold">Voir tous les conseils</button>
      </div>
    </div>
  )
}
