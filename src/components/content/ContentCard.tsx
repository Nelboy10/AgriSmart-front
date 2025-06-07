'use client';

import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ContentCardProps {
  id: string;
  title: string;
  description?: string;
  content_text?: string;
  video_url?: string;
  thumbnail?: string | null;
  type: 'text' | 'video';
  created_at: string;
  category?: {
    name: string;
  };
  author: {
    username: string;
    photo?: string;
  };
}

export default function ContentCard({ content }: { content: ContentCardProps }) {
  // Check if thumbnail is a valid URL
  const isValidThumbnail = content.thumbnail && 
    (content.thumbnail.startsWith('http') || content.thumbnail.startsWith('/'));

  return (
    <Link href={`/blog/${content.id}`} className="group dark:bg-gray-800 dark:border-gray-700">
      <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition h-full flex flex-col dark:bg-gray-800 dark:border-gray-700">
        {isValidThumbnail ? (
          <div className="relative h-48">
            <img
              src={content.thumbnail!}
              alt={content.title}
              className="object-cover w-full h-full"
              onError={(e) => {
                // Fallback if the image fails to load
                const target = e.target as HTMLImageElement;
                target.src = '/images/placeholder.jpg'; // Add a default placeholder image
              }}
            />
          </div>
        ) : (
          <div className="relative h-48 bg-gray-100 flex items-center justify-center">
            <span className="text-gray-400">Pas d'image</span>
          </div>
        )}
        
        {/* Rest of your component remains the same */}
        <div className="p-4 flex-1 flex flex-col">
          <div className="flex items-center space-x-2 mb-2">
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
              {content.type === 'text' ? 'Article' : 'Vidéo'}
            </span>
            <span className="text-sm text-gray-500">
              {format(new Date(content.created_at), 'PPP', { locale: fr })}
            </span>
          </div>
          
          <h3 className="text-lg font-semibold mb-2 group-hover:text-green-600 transition">
            {content.title}
          </h3>
          
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {content.description || content.content_text?.substring(0, 150)}...
          </p>
          
          {content.category && (
            <div className="mt-auto">
              <span className="text-sm text-green-700 font-medium">
                {content.category.name}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}