'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import ContentForm from '@/components/content/ContentForm';
import { useAuthStore } from '@/stores/auth-store';
import { useAuthInitialization } from '@/stores/auth-store';

export default function CreateContentPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const { isHydrated } = useAuthInitialization();
  const [contentType, setContentType] = useState<'text' | 'video' | null>(null);

  if (!isHydrated) {
    return <div>Chargement...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8 text-center dark:bg-gray-800 dark:text-white pt-24 pb-24">
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
          'Authorization': `Bearer ${useAuthStore.getState().token}`,
        },
        body: formData,
      });

      if (response.ok) {
        toast.success('Contenu créé avec succès!');
        router.push('/blog');
      } else {
        const errorData = await response.json();
        toast.error(`Erreur: ${errorData.detail || 'Une erreur est survenue'}`);
      }
    } catch (error) {
      toast.error('Erreur réseau lors de la publication');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 dark:bg-gray-800 dark:text-white pt-24 pb-24">
      <h1 className="text-3xl font-bold text-green-800 mb-8">Nouveau Contenu</h1>
      
      {!contentType ? (
        <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
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