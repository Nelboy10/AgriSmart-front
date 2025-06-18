import { Suspense } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/product/ProductCard';
import SearchFilters from '@/components/product/SearchFilters';
import { fetchProducts } from '@/lib/api';
import { getToken } from '@/lib/auth';
import { PlusIcon } from '@/components/icons'; // Import de l'icône

interface ProductsPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const token = await getToken();
  let userRole: string | undefined = undefined;

  // If token is a JWT string, decode it to get userRole
  if (token) {
    try {
      const payload = JSON.parse(
        Buffer.from(token.split('.')[1], 'base64').toString('utf-8')
      );
      userRole = payload.userRole;
    } catch (e) {
      userRole = undefined;
    }
  }

  const products = await fetchProducts(searchParams, token ?? undefined);

  // Vérifier si l'utilisateur est un agriculteur ou admin
  const isFarmerOrAdmin = userRole === 'farmer' || userRole === 'admin';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Nos Produits Agricoles</h1>
        
        {/* Bouton conditionnel */}
       
          <Link 
            href="/products/create" 
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center"
          >
            <PlusIcon className="w-5 h-5 mr-1" />
            Ajouter un produit
          </Link>
      
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <SearchFilters />
        </div>
        
        <div className="md:col-span-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Suspense fallback={
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Chargement des produits...</p>
              </div>
            }>
              {products.length > 0 ? (
                products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-600">Aucun produit trouvé</p>
                </div>
              )}
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}