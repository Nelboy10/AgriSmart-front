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
    formState: { errors },
    setValue,
    watch,
  } = useForm<ProductFormData>();
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
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">Ajouter un Nouveau Produit</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1">Nom du produit *</label>
            <input
              type="text"
              {...register("name", {
                required: "Ce champ est requis",
                minLength: { value: 3, message: "Au moins 3 caractères" },
              })}
              className="w-full p-2 border rounded"
            />
            {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description *</label>
            <textarea
              rows={4}
              {...register("description", {
                required: "Ce champ est requis",
                minLength: { value: 10, message: "Au moins 10 caractères" },
              })}
              className="w-full p-2 border rounded"
            />
            {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Prix (FCFA) *</label>
              <input
                type="number"
                step="0.01"
                min="1"
                {...register("price", {
                  required: "Ce champ est requis",
                  min: { value: 1, message: "Le prix doit être positif" },
                })}
                className="w-full p-2 border rounded"
              />
              {errors.price && <p className="text-red-500 text-sm">{errors.price.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Catégorie *</label>
              <select
                {...register("category", { required: "Ce champ est requis" })}
                className="w-full p-2 border rounded"
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
              {errors.category && <p className="text-red-500 text-sm">{errors.category.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Quantité disponible *</label>
              <input
                type="number"
                min="1"
                {...register("available_quantity", {
                  required: "Ce champ est requis",
                  min: { value: 1, message: "Minimum 1" },
                })}
                className="w-full p-2 border rounded"
              />
              {errors.available_quantity && <p className="text-red-500 text-sm">{errors.available_quantity.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Unité</label>
              <input type="text" {...register("unit")} className="w-full p-2 border rounded" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Date de récolte</label>
              <input type="date" {...register("harvest_date")} className="w-full p-2 border rounded" />
            </div>
          </div>

          <div>
            <label className="flex items-center">
              <input type="checkbox" {...register("organic")} className="mr-2" /> Produit biologique
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Image du produit *</label>
            {imagePreview ? (
              <div>
                <img src={imagePreview} alt="Preview" className="max-w-xs max-h-48 rounded border" />
                <button
                  type="button"
                  onClick={() => {
                    setImagePreview(null);
                    setFile(null);
                    setValue("image", null as any);
                  }}
                  className="text-sm text-red-500 mt-2"
                >
                  Changer d'image
                </button>
              </div>
            ) : (
              <label className="block border-2 border-dashed rounded-lg p-6 text-center cursor-pointer bg-gray-50 hover:bg-gray-100">
                <span className="block text-sm text-gray-600 mb-2">Uploader une image</span>
                <input
                  type="file"
                  accept="image/*"
                  {...register("image", { required: "Une image est requise" })}
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
            {errors.image && <p className="text-red-500 text-sm mt-1">{errors.image.message}</p>}
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => router.push("/products")}
              className="bg-gray-300 text-gray-800 px-6 py-2 rounded hover:bg-gray-400"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:opacity-50"
            >
              {isSubmitting ? "Création..." : "Créer le produit"}
            </button>
          </div>
        </form>
      </div>
    </div>
    
  );
}
