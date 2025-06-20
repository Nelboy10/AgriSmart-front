import { Suspense } from 'react';
import ProductCard from '@/components/product/ProductCard';
import SearchFilters from '@/components/product/SearchFilters';
import { fetchProducts } from '@/lib/api';
import AddProductButton from '@/components/product/AddProductButton';

export type SearchParamsPromise = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function ProductsPage({ searchParams }: { searchParams: SearchParamsPromise }) {
  const resolvedParams = await searchParams;

  const products = await fetchProducts(resolvedParams);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Nos Produits Agricoles</h1>
        {/* Bouton client qui gère la logique de rôle */}
        <AddProductButton />
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

export const dynamic = 'force-dynamic';
