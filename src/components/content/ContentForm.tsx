'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/auth-store'; // Importez le store


interface ContentFormProps {
  contentType: 'text' | 'video';
  onSubmit: (data: any) => void;
  onCancel: () => void;
}




export default function ContentForm({ contentType, onSubmit, onCancel }: ContentFormProps) {
  const { token, isAuthenticated } = useAuthStore(); // Récupérez le token et l'état d'authentification
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: contentType,
    category: '',
    language: '',
    content_text: '',
    video_url: '',
  });
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

  const onDropThumbnail = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file.size > MAX_FILE_SIZE) {
      setError("L'image est trop volumineuse (max 100MB)");
      return;
    }
    setThumbnail(file);
    setError(null);
  }, []);

  const onDropVideo = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file.size > MAX_FILE_SIZE) {
      setError("La vidéo est trop volumineuse (max 100MB)");
      return;
    }
    setVideoFile(file);
    setError(null);
  }, []);

  const { getRootProps: getThumbnailRootProps, getInputProps: getThumbnailInputProps } = useDropzone({
    onDrop: onDropThumbnail,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    maxFiles: 1
  });

  const { getRootProps: getVideoRootProps, getInputProps: getVideoInputProps } = useDropzone({
    onDrop: onDropVideo,
    accept: {
      'video/*': ['.mp4', '.mov', '.avi']
    },
    maxFiles: 1
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!isAuthenticated || !token) {
      setError('Veuillez vous connecter pour publier du contenu');
      return;
    }

    setIsUploading(true);

    try {
      const formDataToSend = new FormData();
      
      // Ajout des champs texte
      Object.entries(formData).forEach(([key, value]) => {
        if (value) formDataToSend.append(key, value);
      });

      // Ajout des fichiers
      if (thumbnail) {
        formDataToSend.append('thumbnail', thumbnail);
      }

      if (contentType === 'video' && videoFile) {
        formDataToSend.append('video_file', videoFile);
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/content/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Erreur lors de la création du contenu');
      }

      const result = await response.json();
      onSubmit(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(message);
      console.error('Erreur:', err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">
        {contentType === 'text' ? 'Nouvel Article' : 'Nouvelle Vidéo'}
      </h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie *</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            >
              <option value="">Sélectionnez...</option>
              <option value="1">Culture</option>
              <option value="2">Élevage</option>
              <option value="3">Gestion</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Langue *</label>
            <select
              name="language"
              value={formData.language}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            >
              <option value="">Sélectionnez...</option>
              <option value="1">Français</option>
              <option value="2">Anglais</option>
            </select>
          </div>
        </div>

        {contentType === 'text' ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contenu *</label>
            <textarea
              name="content_text"
              value={formData.content_text}
              onChange={handleChange}
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
        ) : (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL de la vidéo (optionnel)</label>
              <input
                type="url"
                name="video_url"
                value={formData.video_url}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="https://example.com/video.mp4"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ou télécharger une vidéo</label>
              <div {...getVideoRootProps()} className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center cursor-pointer hover:bg-gray-50">
                <input {...getVideoInputProps()} />
                {videoFile ? (
                  <p className="text-green-600">{videoFile.name}</p>
                ) : (
                  <p>Glissez-déposez une vidéo ici, ou cliquez pour sélectionner</p>
                )}
              </div>
              <p className="mt-1 text-xs text-gray-500">Formats acceptés: .mp4, .mov, .avi (max 100MB)</p>
            </div>
          </>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Miniature {contentType === 'video' ? '(recommandé)' : ''}
          </label>
          <div {...getThumbnailRootProps()} className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center cursor-pointer hover:bg-gray-50">
            <input {...getThumbnailInputProps()} />
            {thumbnail ? (
              <div className="flex items-center justify-center">
                <img 
                  src={URL.createObjectURL(thumbnail)} 
                  alt="Preview" 
                  className="h-20 object-cover rounded"
                />
              </div>
            ) : (
              <p>Glissez-déposez une image ici, ou cliquez pour sélectionner</p>
            )}
          </div>
          <p className="mt-1 text-xs text-gray-500">Formats acceptés: .jpg, .jpeg, .png (max 100MB)</p>
        </div>

        <div className="pt-4 flex justify-end space-x-3">
          <Button
            type="button"
            onClick={onCancel}
            variant="outline"
            disabled={isUploading}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            className="bg-green-600 hover:bg-green-700"
            disabled={isUploading}
          >
            {isUploading ? 'Publication en cours...' : 'Publier'}
          </Button>
        </div>
      </form>
    </div>
  );
}