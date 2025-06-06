'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import ContentForm from '@/components/content/ContentForm';
import { toast } from 'react-hot-toast';

export default function CreateContentPage() {
  const { user, token } = useAuthStore();
  const router = useRouter();
  const [contentType, setContentType] = useState<'text' | 'video' | null>(null);

  const handleSubmit = async (formData: any) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/content/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success('Contenu créé avec succès!');
        router.push('/blog');
      } else {
        const errorData = await response.json();
        toast.error(`Erreur: ${errorData.detail || 'Une erreur est survenue'}`);
      }
    } catch (error) {
      toast.error('Erreur réseau');
      console.error('Error:', error);
    }
  };

  if (!user || (user?.role !== 'expert' && user?.role !== 'admin')) {
    return (
      <div className="container mx-auto px-4 py-8 text-center pt-24 pb-24">
        <h2 className="text-2xl font-bold text-red-600">Accès refusé</h2>
        <p className="mt-4">Seuls les experts et administrateurs peuvent créer du contenu.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 pt-24 pb-24">
      <h1 className="text-3xl font-bold text-green-800 mb-8">Nouveau Contenu</h1>
      
      {!contentType ? (
        <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
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