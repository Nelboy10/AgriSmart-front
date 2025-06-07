'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import ContentList from '@/components/content/ContentList';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useContentStore } from '@/stores/auth-store';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Filter, Search } from 'lucide-react';

interface Category {
  id: number;
  name: string;
}

interface Language {
  id: number;
  name: string;
  code: string;
}

export default function BlogPage() {
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();
  const [contents, setContents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  // États pour les filtres
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [categories, setCategories] = useState<Category[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [filtersLoading, setFiltersLoading] = useState(true);

  // États pour la recherche
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchInput, setSearchInput] = useState<string>('');

  const contentTypes = [
    { value: 'text', label: 'Texte' },
    { value: 'video', label: 'Vidéo' }
  ];

  // Récupérer les catégories depuis l'API (même endpoint que ContentForm)
  const fetchCategories = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories/`);
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Erreur lors de la récupération des catégories:', error);
    }
  };

  // Récupérer les langues depuis l'API (même endpoint que ContentForm)
  const fetchLanguages = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/languages/`);
      const data = await response.json();
      setLanguages(data);
    } catch (error) {
      console.error('Erreur lors de la récupération des langues:', error);
    }
  };

  // Charger les données des filtres au montage du composant
  useEffect(() => {
    const fetchFiltersData = async () => {
      setFiltersLoading(true);
      try {
        await Promise.all([fetchCategories(), fetchLanguages()]);
      } finally {
        setFiltersLoading(false);
      }
    };
    fetchFiltersData();
  }, []);

  const fetchContents = async (resetContents = false) => {
    setLoading(true);
    try {
      const currentPage = resetContents ? 1 : page;
      
      // Construire les paramètres de filtrage
      const params = new URLSearchParams({
        is_validated: 'true',
        page: currentPage.toString()
      });
      
      // Ajouter la recherche si elle existe
      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }
      
      // Essayer différents formats de paramètres selon ton API backend
      if (selectedCategory !== 'all') {
        // Essayer différents noms de paramètres possibles
        params.append('category', selectedCategory);
        params.append('category_id', selectedCategory);
        params.append('category__id', selectedCategory);
      }
      
      if (selectedType !== 'all') {
        // Essayer différents noms pour le type
        params.append('type', selectedType);
        params.append('content_type', selectedType);
      }
      
      if (selectedLanguage !== 'all') {
        params.append('language', selectedLanguage);
        params.append('language_id', selectedLanguage);
        params.append('language__id', selectedLanguage);
      }
      
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/content/?${params.toString()}`,
        {
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${useAuthStore.getState().token}`,
          },
        }
      );
      
      if (!res.ok) {
        throw new Error(`Erreur HTTP! Statut: ${res.status}`);
      }
      
      const data = await res.json();
      console.log('Réponse API brute:', data);
      
      let newContents: any[] = [];
      
      if (Array.isArray(data)) {
        newContents = data;
        if (data.length === 0) {
          setHasMore(false);
        }
      } else if (data && Array.isArray(data.results)) {
        newContents = data.results;
        if (data.results.length === 0) {
          setHasMore(false);
        }
      } else {
        console.error('Format de réponse inattendu:', data);
        setHasMore(false);
      }

      if (resetContents) {
        setContents(newContents);
        setPage(1);
      } else {
        setContents(prev => [...(prev || []), ...newContents]);
      }
      
    } catch (error) {
      console.error('Erreur lors de la récupération des contenus:', error);
    } finally {
      setLoading(false);
    }
  };

  // Effet pour le chargement initial et la pagination
  useEffect(() => {
    if (page === 1) {
      fetchContents(true);
    } else {
      fetchContents(false);
    }
  }, [page]);

  // Effet pour recharger quand les filtres ou la recherche changent
  useEffect(() => {
    setPage(1);
    setHasMore(true);
    fetchContents(true);
  }, [selectedCategory, selectedType, selectedLanguage, searchQuery]);

  // Effet pour gérer le refresh après création
  const { shouldRefresh, setShouldRefresh } = useContentStore();

  useEffect(() => {
    if (shouldRefresh) {
      setPage(1);
      setHasMore(true);
      fetchContents(true);
      setShouldRefresh(false);
    }
  }, [shouldRefresh]);

  const handleCreate = () => {
    router.push('/blog/create');
  };

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      setPage(p => p + 1);
    }
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
  };

  const handleTypeChange = (value: string) => {
    setSelectedType(value);
  };

  const handleLanguageChange = (value: string) => {
    setSelectedLanguage(value);
  };

  // Gérer la recherche
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput);
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  const clearSearch = () => {
    setSearchInput('');
    setSearchQuery('');
  };

  const clearFilters = () => {
    setSelectedCategory('all');
    setSelectedType('all');
    setSelectedLanguage('all');
    setSearchInput('');
    setSearchQuery('');
  };

  const hasActiveFilters = selectedCategory !== 'all' || selectedType !== 'all' || selectedLanguage !== 'all' || searchQuery.trim() !== '';

  // Fonction pour obtenir le nom de la catégorie sélectionnée
  const getSelectedCategoryName = () => {
    if (selectedCategory === 'all') return '';
    const category = categories.find(cat => cat.id.toString() === selectedCategory);
    return category ? category.name : selectedCategory;
  };

  // Fonction pour obtenir le nom du type sélectionné
  const getSelectedTypeName = () => {
    if (selectedType === 'all') return '';
    const type = contentTypes.find(t => t.value === selectedType);
    return type ? type.label : selectedType;
  };

  // Fonction pour obtenir le nom de la langue sélectionnée
  const getSelectedLanguageName = () => {
    if (selectedLanguage === 'all') return '';
    const language = languages.find(lang => lang.id.toString() === selectedLanguage);
    return language ? language.name : selectedLanguage;
  };

  // Pour tester, vous pouvez forcer l'affichage du bouton
  const showCreateButton = true; // À supprimer après les tests

  return (
    <div className="container mx-auto px-4 py-8 pt-24 pb-24">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-green-800">Bonnes Pratiques Agricoles</h1>
      </div>
      <div className="flex justify-start mb-8">
        {(isAuthenticated && (user?.role === 'expert' || user?.role === 'admin')) || showCreateButton ? (
          <Button onClick={handleCreate} className="bg-green-600 hover:bg-green-700">
            Créer un contenu
          </Button>
        ) : null}
      </div>

      {/* Barre de recherche */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <form onSubmit={handleSearchSubmit} className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Search className="h-5 w-5 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-800">Rechercher</h2>
          </div>
          
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder="Rechercher dans le titre, la description, les catégories..."
                value={searchInput}
                onChange={handleSearchInputChange}
                className="w-full pr-10"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Button type="submit" className="bg-green-600 hover:bg-green-700">
              <Search className="h-4 w-4 mr-2" />
              Rechercher
            </Button>
          </div>

          {/* Affichage de la recherche active */}
          {searchQuery && (
            <div className="flex items-center gap-2 pt-2">
              <span className="text-sm text-gray-600">Recherche active:</span>
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                "{searchQuery}"
                <button
                  type="button"
                  onClick={clearSearch}
                  className="ml-1 hover:text-yellow-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            </div>
          )}
        </form>
      </div>

      {/* Section des filtres */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-5 w-5 text-green-600" />
          <h2 className="text-lg font-semibold text-gray-800">Filtres</h2>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="ml-auto text-gray-500 hover:text-gray-700"
            >
              <X className="h-4 w-4 mr-1" />
              Effacer tout
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Filtre par catégorie */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Catégorie</label>
            <Select value={selectedCategory} onValueChange={handleCategoryChange} disabled={filtersLoading}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Toutes les catégories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les catégories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtre par type */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Type de contenu</label>
            <Select value={selectedType} onValueChange={handleTypeChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Tous les types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                {contentTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtre par langue */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Langue</label>
            <Select value={selectedLanguage} onValueChange={handleLanguageChange} disabled={filtersLoading}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Toutes les langues" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les langues</SelectItem>
                {languages.map((language) => (
                  <SelectItem key={language.id} value={language.id.toString()}>
                    {language.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Affichage des filtres actifs */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
            <span className="text-sm text-gray-600">Filtres actifs:</span>
            {searchQuery && (
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                Recherche: "{searchQuery}"
                <button
                  onClick={clearSearch}
                  className="ml-1 hover:text-yellow-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {selectedCategory !== 'all' && (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Catégorie: {getSelectedCategoryName()}
                <button
                  onClick={() => setSelectedCategory('all')}
                  className="ml-1 hover:text-green-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {selectedType !== 'all' && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                Type: {getSelectedTypeName()}
                <button
                  onClick={() => setSelectedType('all')}
                  className="ml-1 hover:text-blue-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {selectedLanguage !== 'all' && (
              <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                Langue: {getSelectedLanguageName()}
                <button
                  onClick={() => setSelectedLanguage('all')}
                  className="ml-1 hover:text-purple-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
        )}

        {/* Indicateur de chargement des filtres */}
        {filtersLoading && (
          <div className="text-sm text-gray-500 mt-2">
            Chargement des filtres...
          </div>
        )}
      </div>

      {/* Compteur de résultats */}
      {!loading && (
        <div className="mb-4 text-sm text-gray-600">
          {contents.length} contenu{contents.length > 1 ? 's' : ''} trouvé{contents.length > 1 ? 's' : ''}
          {hasActiveFilters && ' avec les filtres appliqués'}
          {searchQuery && ` pour "${searchQuery}"`}
        </div>
      )}

      <ContentList
        contents={contents}
        loading={loading}
        onLoadMore={handleLoadMore}
        hasMore={hasMore}
      />
    </div>
  );
}