import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {product.image && (
        <div className="relative h-48 w-full">
          <img
            src={product.image}
            alt={product.name}
        
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      )}
      <div className="p-4">
        <h3 className="font-semibold text-lg">{product.name}</h3>
        <p className="text-gray-500 text-sm mt-1">{product.category}</p>
        <div className="flex justify-between items-center mt-3">
          <span className="font-bold">{product.price.toFixed(2)} Fcfa</span>
          <Link 
            href={`/products/${product.id}`}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}