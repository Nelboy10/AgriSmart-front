"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useAuth } from '@/context/AuthContext';
import { ProductFormData } from '@/types';
import { createProduct } from '@/lib/api';
import { toast } from 'react-toastify';

export default function CreateProductPage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const { 
    register, 
    handleSubmit, 
    formState: { errors },
    setValue,
    watch
  } = useForm<ProductFormData>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

 
  

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      // Prévisualisation de l'image
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.readyState === 2) {
          setImagePreview(reader.result as string);
        }
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const onSubmit: SubmitHandler<ProductFormData> = async (data) => {
    if (!token) {
      toast.error('Vous devez être connecté pour créer un produit');
      return;
    }
    
    if (!file) {
      toast.error('Veuillez sélectionner une image pour le produit');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('description', data.description);
      formData.append('price', data.price.toString());
      formData.append('category', data.category);
      formData.append('available_quantity', data.available_quantity.toString());
      formData.append('image', file);
      
      if (data.unit) formData.append('unit', data.unit);
      if (data.harvest_date) formData.append('harvest_date', data.harvest_date);
      if (data.organic) formData.append('organic', data.organic.toString());
      
      const product = await createProduct(formData, token);
      
      toast.success('Produit créé avec succès!');
      
      // Redirection vers la page du produit
      router.push(`/products/${product.id}`);
    } catch (error) {
      toast.error('Erreur lors de la création du produit');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">Ajouter un Nouveau Produit</h1>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1">
              Nom du produit *
            </label>
            <input
              type="text"
              {...register('name', { 
                required: 'Ce champ est requis',
                minLength: {
                  value: 3,
                  message: 'Le nom doit contenir au moins 3 caractères'
                }
              })}
              className="w-full p-2 border rounded focus:ring-green-500 focus:border-green-500"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">
              Description *
            </label>
            <textarea
              rows={4}
              {...register('description', { 
                required: 'Ce champ est requis',
                minLength: {
                  value: 10,
                  message: 'La description doit contenir au moins 10 caractères'
                }
              })}
              className="w-full p-2 border rounded focus:ring-green-500 focus:border-green-500"
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Prix (€) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0.1"
                {...register('price', { 
                  required: 'Ce champ est requis',
                  min: {
                    value: 0.1,
                    message: 'Le prix doit être supérieur à 0'
                  }
                })}
                className="w-full p-2 border rounded focus:ring-green-500 focus:border-green-500"
              />
              {errors.price && (
                <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                Catégorie *
              </label>
              <select
                {...register('category', { required: 'Ce champ est requis' })}
                className="w-full p-2 border rounded focus:ring-green-500 focus:border-green-500"
              >
                <option value="">Sélectionnez une catégorie</option>
                <option value="legumes">Légumes</option>
                <option value="fruits">Fruits</option>
                <option value="produits-laitiers">Produits laitiers</option>
                <option value="viandes">Viandes</option>
                <option value="oeufs">Œufs</option>
                <option value="miels">Miels</option>
                <option value="confitures">Confitures</option>
                <option value="autres">Autres</option>
              </select>
              {errors.category && (
                <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                Quantité disponible *
              </label>
              <input
                type="number"
                min="1"
                {...register('available_quantity', { 
                  required: 'Ce champ est requis',
                  min: {
                    value: 1,
                    message: 'La quantité doit être au moins 1'
                  }
                })}
                className="w-full p-2 border rounded focus:ring-green-500 focus:border-green-500"
              />
              {errors.available_quantity && (
                <p className="text-red-500 text-sm mt-1">{errors.available_quantity.message}</p>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Unité (kg, pièce, etc.)
              </label>
              <input
                type="text"
                {...register('unit')}
                className="w-full p-2 border rounded focus:ring-green-500 focus:border-green-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                Date de récolte
              </label>
              <input
                type="date"
                {...register('harvest_date')}
                className="w-full p-2 border rounded focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>
          
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                {...register('organic')}
                className="mr-2"
              />
              Produit issu de l'agriculture biologique
            </label>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">
              Image du produit *
            </label>
            
            {imagePreview ? (
              <div className="mt-2">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="max-w-xs max-h-48 rounded-lg border"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImagePreview(null);
                    setFile(null);
                    setValue('image', null as any);
                  }}
                  className="mt-2 text-red-600 hover:text-red-800 text-sm"
                >
                  Changer d'image
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                    </svg>
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Cliquer pour uploader</span> ou glisser-déposer
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG, JPEG (MAX. 5MB)</p>
                  </div>
                  <input 
                    id="dropzone-file" 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    {...register('image', { required: 'Une image est requise' })}
                    onChange={handleImageChange}
                  />
                </label>
              </div>
            )}
            {errors.image && (
              <p className="text-red-500 text-sm mt-1">{errors.image.message}</p>
            )}
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => router.push('/products')}
              className="bg-gray-300 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Création en cours...' : 'Créer le produit'}
            </button>
          </div>
        </form>
      </div>
      
      <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-4">
        <h2 className="font-semibold text-lg text-green-800 mb-2">Conseils pour les producteurs</h2>
        <ul className="list-disc pl-5 space-y-1 text-green-700">
          <li>Fournissez une description détaillée et précise de votre produit</li>
          <li>Utilisez une photo de haute qualité montrant clairement le produit</li>
          <li>Indiquez la date de récolte pour les produits frais</li>
          <li>Précisez si votre produit est issu de l'agriculture biologique</li>
          <li>Mettez régulièrement à jour les quantités disponibles</li>
        </ul>
      </div>
    </div>
  );
}