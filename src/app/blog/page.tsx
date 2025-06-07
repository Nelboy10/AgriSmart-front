'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import ContentList from '@/components/content/ContentList';
import { Button } from '@/components/ui/button';
import { useContentStore } from '@/stores/auth-store';

export default function BlogPage() {
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [contents, setContents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchContents = async (resetContents = false) => {
    setLoading(true);
    try {
      const currentPage = resetContents ? 1 : page;
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/content/?is_validated=true&page=${currentPage}`,
        {
          headers: {
            'Accept': 'application/json', // Explicitement demander du JSON
            'Authorization': `Bearer ${useAuthStore.getState().token}`,
          },
        }
      );
      
      if (!res.ok) {
        throw new Error(`Erreur HTTP! Statut: ${res.status}`);
      }
      
      const data = await res.json();
      console.log('Réponse API brute:', data);
      
      let newContents: any[] = [];
      
      // Si la réponse est directement un tableau
      if (Array.isArray(data)) {
        newContents = data;
        if (data.length === 0) {
          setHasMore(false);
        }
      }
      // Si la réponse est un objet avec une propriété results
      else if (data && Array.isArray(data.results)) {
        newContents = data.results;
        if (data.results.length === 0) {
          setHasMore(false);
        }
      }
      // Si la structure est inattendue
      else {
        console.error('Format de réponse inattendu:', data);
        setHasMore(false);
      }

      if (resetContents) {
        // Remplacer complètement la liste
        setContents(newContents);
        setPage(1);
      } else {
        // Ajouter à la liste existante
        setContents(prev => [...(prev || []), ...newContents]);
      }
      
    } catch (error) {
      console.error('Erreur lors de la récupération des contenus:', error);
    } finally {
      setLoading(false);
    }
  };

  // Effet pour le chargement initial et la pagination
  useEffect(() => {
    if (page === 1) {
      fetchContents(true); // Reset contents for first page
    } else {
      fetchContents(false); // Append for other pages
    }
  }, [page]);

  // Effet pour gérer le refresh après création
  const { shouldRefresh, setShouldRefresh } = useContentStore();

  useEffect(() => {
    if (shouldRefresh) {
      setPage(1);
      setHasMore(true);
      fetchContents(true);
      setShouldRefresh(false); // Reset le flag
    }
  }, [shouldRefresh]);

  const handleCreate = () => {
    router.push('/blog/create');
  };

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      setPage(p => p + 1);
    }
  };

  // Debug logs
  useEffect(() => {
    console.log('Contenu actuel:', contents);
    console.log('Page actuelle:', page);
    console.log('Afficher le bouton?', isAuthenticated && (user?.role === 'expert' || user?.role === 'admin'));
  }, [contents, page, isAuthenticated, user]);

  console.log('Auth State:', {
    isAuthenticated,
    userRole: user?.role,
    user
  });

  // Pour tester, vous pouvez forcer l'affichage du bouton
  const showCreateButton = true; // À supprimer après les tests

  return (
    <div className="container mx-auto px-4 py-8 pt-24 pb-24">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-green-800">Bonnes Pratiques Agricoles</h1>
        {(isAuthenticated && (user?.role === 'expert' || user?.role === 'admin')) || showCreateButton ? (
          <Button onClick={handleCreate} className="bg-green-600 hover:bg-green-700">
            Créer un contenu
          </Button>
        ) : null}
      </div>

      <ContentList
        contents={contents}
        loading={loading}
        onLoadMore={handleLoadMore}
        hasMore={hasMore}
      />
    </div>
  );
}