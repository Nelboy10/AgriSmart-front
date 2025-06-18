'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Category, Seller } from '@/types';

export default function SearchFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSeller, setSelectedSeller] = useState('');

  // Récupérer les filtres initiaux depuis l'URL
  useEffect(() => {
    setSearchQuery(searchParams.get('search') || '');
    setSelectedCategory(searchParams.get('category') || '');
    setSelectedSeller(searchParams.get('seller') || '');
  }, [searchParams]);

  // Simuler la récupération des données (remplacer par vos appels API)
  useEffect(() => {
    // En production, remplacer par:
    // fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories/`)
    //   .then(res => res.json())
    //   .then(setCategories);
    
    setCategories([
      { id: 1, name: 'Légumes' },
      { id: 2, name: 'Fruits' },
      { id: 3, name: 'Produits laitiers' },
      { id: 4, name: 'Viandes' },
    ]);
    
    // fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sellers/`)
    //   .then(res => res.json())
    //   .then(setSellers);
    
    setSellers([
      { id: 1, username: 'Ferme Dupont' },
      { id: 2, username: 'Ferme Martin' },
      { id: 3, username: 'Ferme Lambert' },
    ]);
  }, []);

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (searchQuery) params.set('search', searchQuery);
    else params.delete('search');
    
    if (selectedCategory) params.set('category', selectedCategory);
    else params.delete('category');
    
    if (selectedSeller) params.set('seller', selectedSeller);
    else params.delete('seller');
    
    router.replace(`${pathname}?${params.toString()}`);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedSeller('');
    router.replace(pathname);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="font-semibold text-lg mb-4">Filtrer les produits</h3>
      
      {/* Barre de recherche */}
      <div className="mb-4">
        <label htmlFor="search" className="block text-sm font-medium mb-1">
          Recherche
        </label>
        <input
          type="text"
          id="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Nom, description..."
          className="w-full p-2 border rounded"
        />
      </div>
      
      {/* Filtre par catégorie */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">
          Catégorie
        </label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="">Toutes les catégories</option>
          {categories.map(category => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>
      
      {/* Filtre par vendeur */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">
          Vendeur
        </label>
        <select
          value={selectedSeller}
          onChange={(e) => setSelectedSeller(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="">Tous les vendeurs</option>
          {sellers.map(seller => (
            <option key={seller.id} value={seller.id}>
              {seller.username}
            </option>
          ))}
        </select>
      </div>
      
      {/* Boutons d'action */}
      <div className="flex gap-2">
        <button
          onClick={applyFilters}
          className="flex-1 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
        >
          Appliquer
        </button>
        <button
          onClick={resetFilters}
          className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300"
        >
          Réinitialiser
        </button>
      </div>
    </div>
  );
}