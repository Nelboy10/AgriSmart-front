import Link from 'next/link';
import ContentCard from './ContentCard';

interface ContentListProps {
  contents: any[];
  loading: boolean;
  onLoadMore: () => void;
  hasMore: boolean;
}

export default function ContentList({ contents, loading, onLoadMore, hasMore }: ContentListProps) {
  // Supprimer les doublons basés sur l'ID
  const uniqueContents = contents.filter(
    (content, index, self) => 
      index === self.findIndex((c) => c.id === content.id)
  );

  if (uniqueContents.length === 0 && !loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Aucun contenu disponible pour le moment.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {uniqueContents.map(content => (
          <ContentCard 
            key={`${content.id}-${content.updated_at || ''}`} 
            content={content} 
          />
        ))}
      </div>

      {hasMore && (
        <div className="mt-8 text-center">
          <button
            onClick={onLoadMore}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Chargement...' : 'Voir plus'}
          </button>
        </div>
      )}
    </div>
  );
}