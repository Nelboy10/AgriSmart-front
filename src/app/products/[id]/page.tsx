import { Suspense } from 'react';
import ProductDetail from '@/components/product/ProductDetail';
import OrderForm from '@/components/product/OrderForm';
import { fetchProduct } from '@/lib/api';
import { getToken } from '@/lib/auth';

interface ProductDetailPageProps {
  params: {
    id: string;
  };
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const token = await getToken();
  const product = await fetchProduct(params.id, token ?? undefined);

  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<div>Loading product...</div>}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ProductDetail product={product} />
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Place Order</h2>
            <OrderForm product={product} />
          </div>
        </div>
      </Suspense>
    </div>
  );
}