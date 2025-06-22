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

  const hasActiveFilters = searchQuery || selectedCategory || selectedSeller;

  return (
    <div className="space-y-4">
      {/* Barre de recherche principale */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Rechercher des produits..."
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white focus:bg-white placeholder-gray-500"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Filtres avancés */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Filtre par catégorie */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Catégorie
          </label>
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full appearance-none bg-white border border-gray-200 rounded-lg px-3 py-2.5 pr-8 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 hover:border-gray-300 cursor-pointer"
            >
              <option value="">Toutes</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Filtre par vendeur */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Vendeur
          </label>
          <div className="relative">
            <select
              value={selectedSeller}
              onChange={(e) => setSelectedSeller(e.target.value)}
              className="w-full appearance-none bg-white border border-gray-200 rounded-lg px-3 py-2.5 pr-8 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 hover:border-gray-300 cursor-pointer"
            >
              <option value="">Tous</option>
              {sellers.map(seller => (
                <option key={seller.id} value={seller.id}>
                  {seller.username}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="flex flex-col justify-end space-y-2 md:col-span-2 lg:col-span-2">
          <div className="flex gap-3">
            <button
              onClick={applyFilters}
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-2.5 px-6 rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Rechercher
            </button>
            
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Indicateurs de filtres actifs */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
          <span className="text-xs text-gray-500 font-medium">Filtres actifs:</span>
          
          {searchQuery && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
              Recherche: "{searchQuery}"
              <button
                onClick={() => setSearchQuery('')}
                className="hover:bg-green-200 rounded-full p-0.5"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          )}
          
          {selectedCategory && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
              {categories.find(c => c.id.toString() === selectedCategory)?.name}
              <button
                onClick={() => setSelectedCategory('')}
                className="hover:bg-blue-200 rounded-full p-0.5"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          )}
          
          {selectedSeller && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
              {sellers.find(s => s.id.toString() === selectedSeller)?.username}
              <button
                onClick={() => setSelectedSeller('')}
                className="hover:bg-purple-200 rounded-full p-0.5"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}