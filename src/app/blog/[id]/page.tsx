'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import VideoPlayer from '@/components/content/VideoPlayer';
import { useAuthStore } from '@/stores/auth-store';
import Image from 'next/image';

export default function ContentDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const { isAuthenticated, user, initialized, token } = useAuthStore();

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
          <div className="flex flex-col mt-6 space-y-4">
            <div className="flex items-center space-x-3">
              <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                {content.type === 'text' ? 'Article' : 'Vidéo'}
              </span>
            </div>
            { content.type === 'text' ? (
            <div className="relative w-full h-64 md:h-96 rounded-lg overflow-hidden">
            <img 
              src={content.thumbnail} 
              alt={content.title} 
              className="object-cover w-full h-full"
            />
          </div>
         ) : (
          ''
       )}
        </div>
        </div>

        {content.type === 'video' ? (
          <div className="mb-8">
            <p className="text-lg text-gray-700 mb-6">{content.description}</p>
            <VideoPlayer 
              url={content.video_url} 
              file={content.video_file} 
            />
          </div>
        ) : (
          <div className="prose max-w-none mb-8">
            <p className="text-lg text-gray-700 mb-6">{content.description}</p>
          </div>
        )}

  <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
    <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-2 border-b border-gray-100 dark:text-gray-200">
      À propos de l'auteur
    </h2>
    <div className="flex items-center gap-4">
      <div className="relative">
      {content.author?.photo ? (
        <img 
          src={content.author.photo} 
          alt={content.author.username} 
          className="w-16 h-16 rounded-full object-cover border-2 border-primary-100"
        />
      ) : (
        <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center dark:bg-gray-700">
          <span className="text-2xl font-bold text-green-600 dark:text-green-400">
            {content.author?.username[0]?.toUpperCase()}
          </span>
        </div>
      )}
    </div>
    <div className="space-y-1">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200">
        {content.author?.username.toUpperCase()}
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {content.author?.role}
      </p>
    </div>
  </div>
</div>
</div>
</div>
);
}
