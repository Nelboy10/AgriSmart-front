'use client'

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import ProductDetail from '@/components/product/ProductDetail';
import OrderForm from '@/components/product/OrderForm';
import { fetchProduct } from '@/lib/api';

export type ParamsPromise = Promise<{ id: string }>;

export default function ProductDetailPage({ params }: { params: ParamsPromise }) {
  const [id, setId] = useState<string | null>(null);
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const token = useAuthStore((state) => state.token);

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
    return <div className="container mx-auto px-4 py-8">Chargement du produit...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ProductDetail product={product} />
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Passer une commande</h2>
          <OrderForm product={product} />
        </div>
      </div>
    </div>
  );
}
