import Image from 'next/image';
import { Product } from '@/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import Link from 'next/link';

interface ProductDetailProps {
  product: Product;
}

export default function ProductDetail({ product }: ProductDetailProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      {/* Image principale */}
      <div className="relative h-64 md:h-80 w-full mb-6 rounded-lg overflow-hidden">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
          
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw"
          />
        ) : (
          <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-full flex items-center justify-center text-gray-500">
            Aucune image
          </div>
        )}
      </div>

      {/* Informations principales */}
      <div className="mb-6">
        <div className="flex justify-between items-start">
          <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
          <span className="text-xl font-bold text-green-600">
            {product.price.toFixed(2)} €
          </span>
        </div>

        <div className="flex items-center mt-2">
          <span className="inline-flex items-center bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mr-2">
            {product.category}
          </span>
          <span className="inline-flex items-center bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
            {product.available_quantity} unités disponibles
          </span>
        </div>
      </div>

      {/* Vendeur */}
      <div className="flex items-center mb-6 p-3 bg-gray-50 rounded-lg">
        {product.seller.profile_picture ? (
          <div className="relative w-12 h-12 rounded-full overflow-hidden mr-3">
            <img
              src={product.seller.profile_picture}
              alt={product.seller.username}
              className="object-cover"
              sizes="48px"
            />
          </div>
        ) : (
          <div className="bg-gray-200 border-2 border-dashed rounded-full w-12 h-12 flex items-center justify-center text-gray-500 mr-3">
            <span className="text-xs">Photo</span>
          </div>
        )}
        <div>
          <h3 className="font-medium text-gray-900">Vendu par</h3>
          <p className="text-gray-700">
            <Link 
              href={`/farmers/${product.seller.id}`}
              className="hover:text-green-600 hover:underline"
            >
              {product.seller.username}
            </Link>
          </p>
        </div>
      </div>

      {/* Description */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Description</h2>
        <p className="text-gray-700 whitespace-pre-line">
          {product.description || "Aucune description fournie."}
        </p>
      </div>

      {/* Informations supplémentaires */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2">Statut du produit</h3>
          <div className="flex items-center">
            {product.is_approved ? (
              <span className="inline-flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Approuvé
              </span>
            ) : (
              <span className="inline-flex items-center bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                En attente d'approbation
              </span>
            )}
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2">Date de création</h3>
          <p className="text-gray-700">
            {format(new Date(product.created_at), 'd MMMM yyyy', { locale: fr })}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex space-x-3">
        <Link 
          href={`/farmers/${product.seller.id}`}
          className="flex-1 text-center bg-white border border-green-600 text-green-600 py-2 px-4 rounded hover:bg-green-50 transition-colors"
        >
          Voir la ferme
        </Link>
        
        {product.seller.id !== /* current user id */ null && (
          <Link 
            href={`/products/${product.id}/edit`}
            className="flex-1 text-center bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition-colors"
          >
            Modifier le produit
          </Link>
        )}
      </div>
    </div>
  );
}