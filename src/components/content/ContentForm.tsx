'use client';

import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/auth-store';

interface Category {
  id: number;
  name: string;
}

interface Language {
  id: number;
  name: string;
  code: string;
}

interface ContentFormProps {
  contentType: 'text' | 'video';
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export default function ContentForm({ contentType, onSubmit, onCancel }: ContentFormProps) {
  const { token, isAuthenticated } = useAuthStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [loading, setLoading] = useState(true);
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

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories/`);
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Erreur lors de la récupération des catégories:', error);
    }
  };

  const fetchLanguages = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/languages/`);
      const data = await response.json();
      setLanguages(data);
    } catch (error) {
      console.error('Erreur lors de la récupération des langues:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchCategories(), fetchLanguages()]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (categories.length > 0 && formData.category === '') {
      setFormData(prev => ({ ...prev, category: categories[0].id.toString() }));
    }
    if (languages.length > 0 && formData.language === '') {
      setFormData(prev => ({ ...prev, language: languages[0].id.toString() }));
    }
  }, [categories, languages]);

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

    // Validation côté client
    if (!formData.title.trim()) {
      setError('Le titre est obligatoire');
      return;
    }

    if (!formData.category) {
      setError('Veuillez sélectionner une catégorie');
      return;
    }

    if (!formData.language) {
      setError('Veuillez sélectionner une langue');
      return;
    }

    if (contentType === 'video' && !formData.video_url && !videoFile) {
      setError('Veuillez fournir une URL de vidéo ou télécharger un fichier vidéo');
      return;
    }

    setIsUploading(true);

    try {
      const formDataToSend = new FormData();
      
      // Ajout des champs obligatoires
      formDataToSend.append('title', formData.title.trim());
      formDataToSend.append('description', formData.description.trim());
      formDataToSend.append('type', formData.type);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('language', formData.language);
      
      // Contenu spécifique selon le type
      if (formData.type === 'text') {
        formDataToSend.append('content_text', formData.content_text || formData.description);
      } else if (formData.type === 'video') {
        if (formData.video_url) {
          formDataToSend.append('video_url', formData.video_url);
        }
      }

      // Ajout des fichiers
      if (thumbnail) {
        formDataToSend.append('thumbnail', thumbnail, thumbnail.name);
      }

      if (contentType === 'video' && videoFile) {
        formDataToSend.append('video_file', videoFile, videoFile.name);
      }

      // Debug: afficher le contenu de FormData
      console.log('Données envoyées:');
      for (let [key, value] of formDataToSend.entries()) {
        console.log(key, typeof value === 'object' ? value : value);
      }

      // Passer les données au parent pour l'envoi
      onSubmit(formDataToSend);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de l\'envoi';
      setError(message);
      console.error('Erreur détaillée:', err);
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md dark:bg-gray-900/50 dark:border-gray-700">
      <h2 className="text-xl font-semibold mb-4">
        {contentType === 'text' ? 'Nouvel Article' : 'Nouvelle Vidéo'}
      </h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md dark:bg-red-800 dark:text-red-300">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 dark:bg-gray-900/50 dark:border-gray-700">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-50">Titre *</label>
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
          <label className="block text-sm font-medium text-gray-800 mb-1 dark:text-gray-50">Description *</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder={contentType === 'text' ? 'Contenu de votre article...' : 'Description de votre vidéo...'}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-50 mb-1">Catégorie *</label>
            <select
              name="category"
              value={formData.category || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-900/50 rounded-md"
              required
              disabled={loading}
            >
              <option value="">Sélectionnez une catégorie</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Langue *</label>
            <select
              name="language"
              value={formData.language || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-900/50 rounded-md"
              required
              disabled={loading}
            >
              <option value="">Sélectionnez une langue</option>
              {languages.map((language) => (
                <option key={language.id} value={language.id}>
                  {language.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {contentType === 'text' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contenu détaillé</label>
            <textarea
              name="content_text"
              value={formData.content_text}
              onChange={handleChange}
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-900/50 rounded-md"
              placeholder="Contenu complet de votre article..."
            />
          </div>
        )}

        {contentType === 'video' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL de la vidéo</label>
              <input
                type="url"
                name="video_url"
                value={formData.video_url}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-900/50 rounded-md"
                placeholder="https://example.com/video.mp4"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ou télécharger une vidéo</label>
              <div {...getVideoRootProps()} className="border-2 border-dashed border-gray-300 dark:border-gray-700 dark:bg-gray-900/50 rounded-md p-4 text-center cursor-pointer hover:bg-gray-50">
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
          <div {...getThumbnailRootProps()} className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center cursor-pointer hover:bg-gray-50 dark:bg-gray-900/50">
            <input {...getThumbnailInputProps()} />
            {thumbnail ? (
              <div className="flex items-center justify-center ">
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