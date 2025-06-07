'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import ContentForm from '@/components/content/ContentForm';
import { useAuthStore } from '@/stores/auth-store';
import { useContentStore } from '@/stores/auth-store';

export default function CreateContentPage() {
  const router = useRouter();
  const { isAuthenticated, user, initialized, token } = useAuthStore();
  const [contentType, setContentType] = useState<'text' | 'video' | null>(null);

  if (!initialized) {
    return <div>Chargement...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8 text-center dark:bg-gray-900/50 dark:text-white pt-24 pb-24">
        <h2 className="text-2xl font-bold text-red-600">Non connecté</h2>
        <p className="mt-4">Veuillez vous connecter pour accéder à cette page.</p>
      </div>
    );
  }

  if (user?.role !== 'expert' && user?.role !== 'admin') {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold text-red-600">Permissions insuffisantes</h2>
        <p className="mt-4">
          Votre rôle ({user?.role}) ne permet pas de créer du contenu.
        </p>
      </div>
    );
  }

  const handleSubmit = async (formData: FormData) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/content/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Ne pas ajouter Content-Type pour FormData
        },
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        toast.success('Contenu créé avec succès!');
        useContentStore.getState().setShouldRefresh(true);
        router.push('/blog');
      } else {
        const errorText = await response.text();
        console.error('Réponse du serveur:', errorText);
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          throw new Error(`Erreur HTTP ${response.status}: ${errorText}`);
        }
        
        toast.error(`Erreur: ${errorData.detail || errorData.message || 'Une erreur est survenue'}`);
      }
    } catch (error) {
      console.error('Erreur détaillée:', error);
      const message = error instanceof Error ? error.message : 'Erreur réseau lors de la publication';
      toast.error(message);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 dark:bg-gray-900/50 dark:text-white pt-24 pb-24">
      <h1 className="text-3xl font-bold text-green-800 mb-8">Nouveau Contenu</h1>
      
      {!contentType ? (
        <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md dark:bg-gray-900/50 dark:border-gray-600 dark:text-white">
          <h2 className="text-xl font-semibold mb-6">Choisissez le type de contenu</h2>
          <div className="space-y-4">
            <button
              onClick={() => setContentType('text')}
              className="w-full py-3 px-4 bg-green-100 hover:bg-green-200 rounded-lg text-green-800 font-medium transition"
            >
              Article Textuel
            </button>
            <button
              onClick={() => setContentType('video')}
              className="w-full py-3 px-4 bg-blue-100 hover:bg-blue-200 rounded-lg text-blue-800 font-medium transition"
            >
              Vidéo Pédagogique
            </button>
          </div>
        </div>
      ) : (
        <ContentForm 
          contentType={contentType} 
          onSubmit={handleSubmit}
          onCancel={() => setContentType(null)}
        />
      )}
    </div>
  );
}