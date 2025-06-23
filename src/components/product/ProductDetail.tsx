import Image from 'next/image';
import { Product } from '@/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import Link from 'next/link';

interface ProductDetailProps {
  product: Product;
  isOwner?: boolean;
}

export default function ProductDetail({ product, isOwner = false }: ProductDetailProps) {
  return (
    <div className="bg-gradient-to-br from-white via-green-50/30 to-emerald-50/50 backdrop-blur-sm border border-white/20 shadow-2xl shadow-green-900/10 rounded-3xl overflow-hidden
                  dark:bg-gradient-to-br dark:from-slate-900 dark:via-emerald-900/20 dark:to-slate-900 dark:border-slate-700/50 dark:shadow-slate-950/30">
      
      {/* Image principale avec overlay gradient */}
      <div className="relative h-72 md:h-96 w-full mb-8 overflow-hidden">
        {product.image ? (
          <>
            <img
              src={product.image}
              alt={product.name}
              className="object-cover w-full h-full transition-transform duration-700 hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
            <div className="absolute bottom-6 left-6 right-6">
              <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 drop-shadow-lg">
                    {product.name}
                  </h1>
                  <div className="flex flex-wrap gap-3">
                    <span className="inline-flex items-center bg-white/20 backdrop-blur-md text-white text-sm px-4 py-2 rounded-full border border-white/30 dark:bg-slate-800/70 dark:border-slate-600">
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"/>
                      </svg>
                      {product.category}
                    </span>
                    <span className="inline-flex items-center bg-emerald-500/90 backdrop-blur-md text-white text-sm px-4 py-2 rounded-full border border-emerald-400/50 dark:bg-emerald-600 dark:border-emerald-500/50">
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd"/>
                      </svg>
                      {product.available_quantity} disponibles
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg">
                    {product.price}Fcfa
                  </span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-dashed border-gray-300 rounded-2xl w-full h-full flex items-center justify-center text-gray-400
                        dark:from-slate-800 dark:to-slate-900 dark:border-slate-700">
            <div className="text-center">
              <svg className="w-16 h-16 mx-auto mb-4 opacity-50 dark:text-slate-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd"/>
              </svg>
              <p className="text-lg font-medium dark:text-slate-500">Aucune image</p>
            </div>
          </div>
        )}
      </div>

      <div className="px-8 pb-8">
        {/* Vendeur Card */}
        <div className="flex items-center mb-8 p-6 bg-white/70 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-white/80
                        dark:bg-slate-800/70 dark:border-slate-600/50 dark:hover:bg-slate-800/90">
          {product.seller.profile_picture ? (
            <div className="relative w-16 h-16 rounded-full overflow-hidden mr-4 ring-4 ring-white shadow-lg dark:ring-slate-700">
              <img
                src={product.seller.profile_picture}
                alt={product.seller.username}
                className="object-cover w-full h-full"
                sizes="64px"
              />
            </div>
          ) : (
            <div className="bg-gradient-to-br from-green-400 to-emerald-500 rounded-full w-16 h-16 flex items-center justify-center text-white mr-4 shadow-lg ring-4 ring-white dark:ring-slate-700">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
              </svg>
            </div>
          )}
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1 dark:text-gray-200">Vendu par</h3>
            <p className="text-gray-700 dark:text-gray-300">
              <Link 
                href={`/farmers/${product.seller.id}`}
                className="text-green-600 hover:text-green-700 font-medium hover:underline transition-colors duration-200
                          dark:text-emerald-400 dark:hover:text-emerald-300"
              >
                {product.seller.username}
              </Link>
            </p>
          </div>
          <svg className="w-5 h-5 text-gray-400 dark:text-slate-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
          </svg>
        </div>

        {/* Description */}
        <div className="mb-8 p-6 bg-white/50 backdrop-blur-sm rounded-2xl border border-white/30
                        dark:bg-slate-800/50 dark:border-slate-700">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center dark:text-white">
            <svg className="w-6 h-6 mr-3 text-green-600 dark:text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
            </svg>
            Description
          </h2>
          <p className="text-gray-700 whitespace-pre-line leading-relaxed text-lg dark:text-gray-300">
            {product.description || "Aucune description fournie."}
          </p>
        </div>

        {/* Informations supplémentaires */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-white/40 hover:bg-white/70 transition-all duration-300
                          dark:bg-slate-800/60 dark:border-slate-700/50 dark:hover:bg-slate-800/70">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center text-lg dark:text-white">
              <svg className="w-5 h-5 mr-3 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
              Statut du produit
            </h3>
            <div className="flex items-center">
              {product.is_approved ? (
                <span className="inline-flex items-center bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-3 rounded-xl text-sm font-medium shadow-lg">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Approuvé
                </span>
              ) : (
                <span className="inline-flex items-center bg-gradient-to-r from-yellow-500 to-orange-600 text-white px-4 py-3 rounded-xl text-sm font-medium shadow-lg">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  En attente d'approbation
                </span>
              )}
            </div>
          </div>

          <div className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-white/40 hover:bg-white/70 transition-all duration-300
                          dark:bg-slate-800/60 dark:border-slate-700/50 dark:hover:bg-slate-800/70">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center text-lg dark:text-white">
              <svg className="w-5 h-5 mr-3 text-purple-600 dark:text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
              </svg>
              Date de création
            </h3>
            <p className="text-gray-700 text-lg font-medium dark:text-gray-300">
              {format(new Date(product.created_at), 'd MMMM yyyy', { locale: fr })}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
          <Link 
            href={`/farmers/${product.seller.id}`}
            className="flex-1 text-center bg-white/80 backdrop-blur-sm border-2 border-green-500 text-green-600 py-4 px-6 rounded-2xl hover:bg-green-50 hover:border-green-600 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] transform
                      dark:bg-slate-800/80 dark:border-emerald-500 dark:text-emerald-400 dark:hover:bg-slate-800 dark:hover:border-emerald-400"
          >
            <span className="flex items-center justify-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
              </svg>
              Voir la ferme
            </span>
          </Link>
          
          {isOwner && (
            <Link 
              href={`/products/${product.id}/edit`}
              className="flex-1 text-center bg-gradient-to-r from-green-600 to-emerald-700 text-white py-4 px-6 rounded-2xl hover:from-green-700 hover:to-emerald-800 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] transform
                        dark:from-emerald-600 dark:to-emerald-700 dark:hover:from-emerald-700 dark:hover:to-emerald-800"
            >
              <span className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
                </svg>
                Modifier le produit
              </span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}