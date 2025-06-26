import { Suspense } from 'react';
import Link from 'next/link';
import { fetchProducts } from '@/lib/api';
import ProductCard from '@/components/product/ProductCard';
import SearchFilters from '@/components/product/SearchFilters';
import AddProductButton from '@/components/product/AddProductButton';
import { PlusIcon } from '@/components/icons';

export type SearchParamsPromise = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function ProductsPage({ searchParams }: { searchParams: SearchParamsPromise }) {
  const resolvedParams = await searchParams;
  const products = await fetchProducts(resolvedParams);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50 
                     dark:bg-gradient-to-br dark:from-slate-900 dark:via-emerald-900 dark:to-emerald-950 overflow-x-hidden">

      {/* ---------------------- HERO SECTION ---------------------- */}
      <section className="bg-white dark:bg-slate-800 shadow-sm border-b border-gray-100 dark:border-gray-700">
        <div className="mx-auto max-w-screen-xl px-4 py-12">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 flex-wrap">

            {/* Titre + Description */}
            <div className="space-y-4 max-w-3xl">
              <h1 className="text-4xl lg:text-5xl font-extrabold bg-gradient-to-r from-green-700 via-emerald-600 to-green-800 bg-clip-text text-transparent">
                Nos Produits Agricoles
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                Découvrez notre sélection de produits agricoles frais et de qualité,
                directement de nos producteurs locaux vers votre table.
              </p>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  Produits frais disponibles
                </span>
                <span className="hidden sm:block w-px h-4 bg-gray-300 dark:bg-gray-600" />
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full" />
                  Livraison rapide
                </span>
              </div>
            </div>

            {/* Actions utilisateur */}
            <div className="flex gap-4">
              <Link
                href="/orders"
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center shadow-md"
              >
                <PlusIcon className="w-5 h-5 mr-2" />
                Mes Commandes
              </Link>
              <AddProductButton />
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------- FILTRES ---------------------- */}
      <section className="mx-auto max-w-screen-xl px-4 py-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-3">
            <h2 className="text-white font-medium text-sm flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 
                    6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 
                    7.707A1 1 0 013 7V4z" />
              </svg>
              Filtres
            </h2>
          </div>
          <div className="p-4">
            <SearchFilters />
          </div>
        </div>
      </section>

      {/* ---------------------- CATALOGUE ---------------------- */}
      <section className="mx-auto max-w-screen-xl px-4 pb-12">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow border border-gray-100 dark:border-gray-700 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full" />
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Catalogue des Produits</h2>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 px-3 py-1 rounded-full">
              {products.length} produit{products.length !== 1 ? 's' : ''} disponible{products.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {/* ---------------------- LISTE OU FALLBACK ---------------------- */}
        <Suspense fallback={
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-12 text-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 dark:border-gray-600"></div>
                <div className="absolute top-0 left-0 animate-spin rounded-full h-16 w-16 border-4 border-green-600 border-t-transparent"></div>
              </div>
              <div className="space-y-2">
                <p className="text-lg font-medium text-gray-700 dark:text-gray-300">Chargement des produits...</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Nous préparons votre catalogue</p>
              </div>
            </div>
          </div>
        }>
          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {products.map((product) => (
                <div key={product.id} className="transform transition-all duration-200 hover:scale-[1.01]">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-16 text-center">
              <div className="space-y-6">
                <div className="w-24 h-24 mx-auto bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M9 5l4-2 4 2" />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold text-gray-700 dark:text-gray-300">Aucun produit trouvé</h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
                  Il semble qu'aucun produit ne corresponde à vos critères de recherche.
                  Essayez d'ajuster vos filtres ou de revenir plus tard.
                </p>
                <button className="mt-4 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-medium hover:from-green-700 hover:to-emerald-700 transition-all shadow hover:shadow-xl">
                  Réinitialiser les filtres
                </button>
              </div>
            </div>
          )}
        </Suspense>
      </section>

      {/* ---------------------- FOOTER INFO ---------------------- */}
      <footer className="mx-auto max-w-screen-xl px-4 pb-16">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">

            {/* Bloc Qualité */}
            <div className="space-y-3">
              <div className="w-12 h-12 bg-green-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center mx-auto">
                <svg className="w-6 h-6 text-green-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-200">Qualité Garantie</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Produits frais et de première qualité</p>
            </div>

            {/* Bloc Livraison */}
            <div className="space-y-3">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mx-auto">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-200">Livraison Rapide</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Sous 24-48h dans votre région</p>
            </div>

            {/* Bloc Soutien */}
            <div className="space-y-3">
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center mx-auto">
                <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 
                    0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 
                    3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-200">Support Local</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Soutien direct aux producteurs locaux</p>
            </div>

          </div>
        </div>
      </footer>
    </div>
  );
}

export const dynamic = 'force-dynamic';