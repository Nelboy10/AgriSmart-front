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
  thumbnail?: string;
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
  return (
    <Link href={`/blog/${content.id}`} className="group">
      <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition h-full flex flex-col">
        {content.thumbnail && (
          <div className="relative h-48">
            <Image
              src={content.thumbnail}
              alt={content.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        )}
        
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