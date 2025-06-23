'use client'

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import ProductDetail from '@/components/product/ProductDetail';
import OrderForm from '@/components/product/OrderForm';
import { fetchProduct } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';

export type ParamsPromise = Promise<{ id: string }>;

export default function ProductDetailPage({ params }: { params: ParamsPromise }) {
  const [id, setId] = useState<string | null>(null);
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    const loadParamsAndProduct = async () => {
      try {
        const resolved = await params;
        setId(resolved.id);

        if (resolved.id && token) {
          const prod = await fetchProduct(resolved.id, token);
          setProduct(prod);
        }
      } catch (error) {
        console.error('Erreur de chargement du produit :', error);
      } finally {
        setLoading(false);
      }
    };

    loadParamsAndProduct();
  }, [params, token]);

  if (loading || !product) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Squelette pour le détail du produit */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-6 md:p-8">
            <Skeleton className="h-96 w-full rounded-2xl mb-8" />
            
            <div className="space-y-8">
              <div className="flex items-center mb-8">
                <Skeleton className="w-16 h-16 rounded-full mr-4" />
                <div className="flex-1">
                  <Skeleton className="h-6 w-32 mb-2" />
                  <Skeleton className="h-4 w-48" />
                </div>
                <Skeleton className="w-5 h-5" />
              </div>
              
              <div>
                <Skeleton className="h-8 w-40 mb-4" />
                <Skeleton className="h-24 w-full rounded-xl" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Skeleton className="h-32 rounded-2xl" />
                <Skeleton className="h-32 rounded-2xl" />
              </div>
              
              <div className="flex space-x-4">
                <Skeleton className="h-14 w-full rounded-2xl" />
                <Skeleton className="h-14 w-full rounded-2xl" />
              </div>
            </div>
          </div>
          
          {/* Squelette pour le formulaire de commande */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8">
            <div className="text-center mb-8">
              <Skeleton className="w-16 h-16 rounded-2xl mx-auto mb-4" />
              <Skeleton className="h-8 w-64 mx-auto mb-2" />
              <Skeleton className="h-4 w-80 mx-auto" />
            </div>
            
            <div className="space-y-6">
              <div className="bg-gray-100 dark:bg-slate-700/50 rounded-2xl p-6">
                <div className="flex items-center mb-4">
                  <Skeleton className="w-10 h-10 rounded-xl mr-3" />
                  <Skeleton className="h-6 w-48" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Skeleton className="h-24 rounded-xl" />
                  <Skeleton className="h-24 rounded-xl" />
                  <Skeleton className="h-24 rounded-xl" />
                </div>
              </div>
              
              <div>
                <Skeleton className="h-6 w-40 mb-3" />
                <Skeleton className="h-16 w-full rounded-2xl" />
              </div>
              
              <div>
                <Skeleton className="h-6 w-48 mb-3" />
                <Skeleton className="h-32 w-full rounded-2xl" />
              </div>
              
              <Skeleton className="h-14 w-full rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isOwner = user?.id === product.seller.id;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ProductDetail product={product} isOwner={isOwner} />
        
        {/* Suppression du fond blanc et de l'ombre car OrderForm a son propre style */}
        <div>
          <OrderForm product={product} />
        </div>
      </div>
    </div>
  );
}