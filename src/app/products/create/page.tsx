"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useAuthStore } from '@/stores/auth-store';
import { ProductFormData } from '@/types';
import { createProduct } from '@/lib/api';
import { toast } from 'react-toastify';

export default function CreateProductPage() {
  const { token } = useAuthStore();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
  } = useForm<ProductFormData>({ mode: 'onChange' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);

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
      toast.error("Vous devez être connecté pour créer un produit");
      return;
    }

    if (!file) {
      toast.error("Veuillez sélectionner une image pour le produit");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("description", data.description);
      formData.append("price", data.price.toString());
      formData.append("category", data.category);
      formData.append("available_quantity", data.available_quantity.toString());
      formData.append("image", file);

      if (data.unit) formData.append("unit", data.unit);
      if (data.harvest_date) formData.append("harvest_date", data.harvest_date);
      if (data.organic) formData.append("organic", data.organic.toString());

      const product = await createProduct(formData, token);
      toast.success("Produit créé avec succès !");
      router.push(`/products/${product.id}`);
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la création du produit");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl dark:shadow-slate-900/50 p-6 md:p-8 transition-colors duration-300">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Ajouter un Nouveau Produit
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Remplissez les détails de votre produit agricole
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-7">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Nom du produit *
            </label>
            <input
              type="text"
              {...register("name", {
                required: "Ce champ est requis",
                minLength: { value: 3, message: "Au moins 3 caractères" },
              })}
              className={`w-full p-3 rounded-lg border ${
                errors.name 
                  ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                  : 'border-gray-300 dark:border-slate-600 focus:ring-green-500 focus:border-green-500'
              } bg-white dark:bg-slate-700 text-gray-900 dark:text-white`}
              placeholder="Ex: Tomates cerises bio"
            />
            {errors.name && (
              <p className="mt-1 text-red-500 text-sm">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Description *
            </label>
            <textarea
              rows={4}
              {...register("description", {
                required: "Ce champ est requis",
                minLength: { value: 10, message: "Au moins 10 caractères" },
              })}
              className={`w-full p-3 rounded-lg border ${
                errors.description 
                  ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                  : 'border-gray-300 dark:border-slate-600 focus:ring-green-500 focus:border-green-500'
              } bg-white dark:bg-slate-700 text-gray-900 dark:text-white`}
              placeholder="Décrivez votre produit en détail..."
            />
            {errors.description && (
              <p className="mt-1 text-red-500 text-sm">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Prix (FCFA) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  {...register("price", {
                    required: "Ce champ est requis",
                    min: { value: 1, message: "Le prix doit être positif" },
                  })}
                  className={`w-full pl-8 pr-3 py-3 rounded-lg border ${
                    errors.price 
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 dark:border-slate-600 focus:ring-green-500 focus:border-green-500'
                  } bg-white dark:bg-slate-700 text-gray-900 dark:text-white`}
                  placeholder="0.00"
                />
                <span className="absolute left-3 top-3.5 text-gray-500 dark:text-gray-400">F</span>
              </div>
              {errors.price && (
                <p className="mt-1 text-red-500 text-sm">{errors.price.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Catégorie *
              </label>
              <select
                {...register("category", { required: "Ce champ est requis" })}
                className={`w-full p-3 rounded-lg border ${
                  errors.category 
                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300 dark:border-slate-600 focus:ring-green-500 focus:border-green-500'
                } bg-white dark:bg-slate-700 text-gray-900 dark:text-white`}
              >
                <option value="">Sélectionnez une catégorie</option>
                <option value="cereales">Céréales (maïs, riz, mil, sorgho)</option>
                <option value="tubercules">Tubercules (igname, manioc, patate douce)</option>
                <option value="legumineuses">Légumineuses (niébé, arachide, soja)</option>
                <option value="fruits">Fruits (ananas, mangue, orange, papaye)</option>
                <option value="legumes">Légumes (tomate, gombo, piment, amarante)</option>
                <option value="produits_animaux">Produits animaux (volaille, poisson, viande)</option>
                <option value="equipements">Équipements agricoles</option>
                <option value="autres">Autres</option>
              </select>
              {errors.category && (
                <p className="mt-1 text-red-500 text-sm">{errors.category.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Quantité disponible *
              </label>
              <input
                type="number"
                min="1"
                {...register("available_quantity", {
                  required: "Ce champ est requis",
                  min: { value: 1, message: "Minimum 1" },
                })}
                className={`w-full p-3 rounded-lg border ${
                  errors.available_quantity 
                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300 dark:border-slate-600 focus:ring-green-500 focus:border-green-500'
                } bg-white dark:bg-slate-700 text-gray-900 dark:text-white`}
                placeholder="Ex: 50"
              />
              {errors.available_quantity && (
                <p className="mt-1 text-red-500 text-sm">{errors.available_quantity.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Unité
              </label>
              <input 
                type="text" 
                {...register("unit")} 
                className="w-full p-3 rounded-lg border border-gray-300 dark:border-slate-600 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                placeholder="Ex: Kg, Pièce, Sac"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Date de récolte
              </label>
              <input 
                type="date" 
                {...register("harvest_date")} 
                className="w-full p-3 rounded-lg border border-gray-300 dark:border-slate-600 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex items-center p-3 rounded-lg bg-gray-50 dark:bg-slate-700/50">
            <input 
              type="checkbox" 
              id="organic"
              {...register("organic")} 
              className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <label htmlFor="organic" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Produit biologique
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Image du produit *
            </label>
            {imagePreview ? (
              <div className="relative group">
                <div className="relative overflow-hidden rounded-xl border border-gray-200 dark:border-slate-700">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview(null);
                      setFile(null);
                      setValue("image", null as any);
                    }}
                    className="bg-white dark:bg-slate-700 text-gray-800 dark:text-gray-200 p-2 rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-slate-600"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 text-center cursor-pointer bg-gray-50 dark:bg-slate-700/30 hover:bg-gray-100 dark:hover:bg-slate-700/50 border-gray-300 dark:border-slate-600 transition-colors duration-200">
                <div className="mb-3 p-3 bg-green-100 dark:bg-emerald-900/30 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Télécharger une image
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    PNG, JPG ou JPEG (max. 5MB)
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  {...register("image", { required: "Une image est requise" })}
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
            {errors.image && (
              <p className="mt-2 text-red-500 text-sm">{errors.image.message}</p>
            )}
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={() => router.push("/products")}
              className="px-6 py-3 rounded-lg border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600/70 transition-colors duration-300"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !isValid}
              className={`px-6 py-3 rounded-lg text-white font-medium transition-all duration-300 ${
                isSubmitting || !isValid
                  ? 'bg-gray-400 dark:bg-slate-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-md hover:shadow-lg'
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Création...
                </span>
              ) : (
                "Créer le produit"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}