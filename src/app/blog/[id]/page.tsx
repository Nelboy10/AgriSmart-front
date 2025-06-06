'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import VideoPlayer from '@/components/content/VideoPlayer';

interface PageProps {
    params: {
      id: string;
    };
  }

export default function ContentDetailPage({ params }: PageProps) {
  const { id } = params;
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const fetchContent = async () => {
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/content/${id}/`
          );
          const data = await res.json();
          setContent(data);
        } catch (error) {
          console.error('Error fetching content:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchContent();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p>Chargement...</p>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p>Contenu non trouvé</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 pt-24 pb-24">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <span className="text-sm text-gray-500">
            {format(new Date(content.created_at), 'PPP', { locale: fr })}
          </span>
          <h1 className="text-3xl font-bold text-green-800 mt-2">{content.title}</h1>
          <div className="flex items-center mt-4 space-x-4">
            <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
              {content.type === 'text' ? 'Article' : 'Vidéo'}
            </span>
            <span className="text-gray-600">{content.category?.name}</span>
          </div>
        </div>

        {content.type === 'video' ? (
          <div className="mb-8">
            <VideoPlayer 
              url={content.video_url} 
              file={content.video_file} 
            />
          </div>
        ) : (
          <div className="prose max-w-none mb-8">
            <p className="text-lg text-gray-700 mb-6">{content.description}</p>
            <div className="whitespace-pre-line">{content.content_text}</div>
          </div>
        )}

        <div className="border-t pt-6">
          <h2 className="text-xl font-semibold mb-4">À propos de l'auteur</h2>
          <div className="flex items-center space-x-4">
            {content.author?.photo && (
              <img 
                src={content.author.photo} 
                alt={content.author.username} 
                className="w-12 h-12 rounded-full"
              />
            )}
            <div>
              <h3 className="font-medium">{content.author?.username}</h3>
              <p className="text-sm text-gray-600">{content.author?.role}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}