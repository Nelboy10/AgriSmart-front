'use client';

import { useEffect, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { placeOrder } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
import { toast } from 'react-toastify';
import { Product, CreateOrderData } from '@/types';
import { getNextFriday } from '@/utils/dateUtils';

interface OrderFormProps {
  product: Product;
}

export default function OrderForm({ product }: OrderFormProps) {
  const { 
    register, 
    handleSubmit, 
    formState: { errors }, 
    reset 
  } = useForm<CreateOrderData>();
  
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deliveryDate, setDeliveryDate] = useState<string | null>(null);
  const [orderDisabled, setOrderDisabled] = useState(false);
  const [orderDisabledReason, setOrderDisabledReason] = useState('');

  useEffect(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    
    // 0 = dimanche, 6 = samedi
    if (dayOfWeek >= 6 || dayOfWeek === 0) {
      setOrderDisabled(true);
      const nextMonday = new Date(today);
      nextMonday.setDate(today.getDate() + (8 - dayOfWeek) % 7);
      setOrderDisabledReason(`Les commandes ne sont possibles que du lundi au jeudi. Prochaine ouverture: ${nextMonday.toLocaleDateString('fr-FR')}`);
    } else {
      setOrderDisabled(false);
      const friday = getNextFriday();
      setDeliveryDate(friday.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
      }));
    }
  }, []);

  const onSubmit: SubmitHandler<CreateOrderData> = async (data) => {
    if (!user || !token) {
      toast.error('Vous devez être connecté pour commander');
      return;
    }

    if (orderDisabled) {
      toast.error(orderDisabledReason);
      return;
    }

    setIsSubmitting(true);
    try {
      await placeOrder(product.id, data, token);
      toast.success('Commande passée avec succès');
      reset();
    } catch (error: any) {
      toast.error(error?.message || 'Erreur lors de la commande');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/50 backdrop-blur-sm border border-white/20 shadow-2xl shadow-blue-900/10 rounded-3xl p-8 overflow-hidden">
      {/* Header avec icône */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-lg mb-4">
          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/>
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Passer une commande</h2>
        <p className="text-gray-600 mt-2">Commandez vos produits frais directement auprès du producteur</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Information de livraison */}
        <div className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 backdrop-blur-sm border border-blue-200/50 p-6 rounded-2xl">
          <div className="flex items-center mb-4">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-500 rounded-xl mr-3">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
                <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v8a1 1 0 001 1h2a1 1 0 001-1V8a1 1 0 00-1-1h-2z"/>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-blue-800">Informations de livraison</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/60 backdrop-blur-sm p-4 rounded-xl border border-white/30">
              <div className="flex items-center mb-2">
                <svg className="w-4 h-4 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
                </svg>
                <span className="text-sm font-semibold text-gray-700">Date</span>
              </div>
              <p className="text-blue-700 font-bold">
                {deliveryDate || 'Calcul en cours...'}
              </p>
            </div>
            
            <div className="bg-white/60 backdrop-blur-sm p-4 rounded-xl border border-white/30">
              <div className="flex items-center mb-2">
                <svg className="w-4 h-4 text-purple-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                </svg>
                <span className="text-sm font-semibold text-gray-700">Lieu</span>
              </div>
              <p className="text-blue-700 font-bold">Quartier Zongo</p>
            </div>
            
            <div className="bg-white/60 backdrop-blur-sm p-4 rounded-xl border border-white/30">
              <div className="flex items-center mb-2">
                <svg className="w-4 h-4 text-orange-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                </svg>
                <span className="text-sm font-semibold text-gray-700">Horaires</span>
              </div>
              <p className="text-blue-700 font-bold">08:00 - 14:00</p>
            </div>
          </div>
        </div>

        {/* Quantité */}
        <div className="space-y-3">
          <label className="flex items-center text-lg font-semibold text-gray-800">
            <svg className="w-5 h-5 mr-2 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"/>
            </svg>
            Quantité
            <span className="ml-2 text-sm font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              max: {product.available_quantity}
            </span>
          </label>
          
          <div className="relative">
            <input
              type="number"
              min="1"
              max={product.available_quantity}
              {...register('quantity', {
                required: 'Ce champ est requis',
                max: {
                  value: product.available_quantity,
                  message: 'Stock insuffisant'
                },
                min: {
                  value: 1,
                  message: 'Minimum 1 unité'
                }
              })}
              className={`w-full p-4 text-lg font-semibold border-2 rounded-2xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-green-500/20 ${
                errors.quantity 
                  ? 'border-red-300 bg-red-50' 
                  : orderDisabled 
                    ? 'border-gray-200 bg-gray-50 text-gray-400' 
                    : 'border-gray-200 bg-white hover:border-green-300 focus:border-green-500'
              }`}
              disabled={orderDisabled}
              placeholder="Entrez la quantité désirée"
            />
            
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"/>
              </svg>
            </div>
          </div>
          
          {errors.quantity && (
            <div className="flex items-center mt-2 text-red-600">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
              </svg>
              <span className="text-sm font-medium">{errors.quantity.message}</span>
            </div>
          )}
        </div>

        {/* Notes */}
        <div className="space-y-3">
          <label className="flex items-center text-lg font-semibold text-gray-800">
            <svg className="w-5 h-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z"/>
              <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z"/>
            </svg>
            Notes pour l'agriculteur
            <span className="ml-2 text-sm font-normal text-gray-500">(optionnel)</span>
          </label>
          
          <div className="relative">
            <textarea
              {...register('client_notes')} 
              className={`w-full p-4 text-base border-2 rounded-2xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-500/20 resize-none ${
                orderDisabled 
                  ? 'border-gray-200 bg-gray-50 text-gray-400' 
                  : 'border-gray-200 bg-white hover:border-blue-300 focus:border-blue-500'
              }`}
              rows={4}
              placeholder="Ajoutez des instructions spécifiques pour la livraison, des préférences de conditionnement, ou toute autre information utile..."
              disabled={orderDisabled}
            />
            
            <div className="absolute bottom-4 right-4">
              <svg className="w-5 h-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Alerte ordre désactivé */}
        {orderDisabled && (
          <div className="bg-gradient-to-r from-yellow-400/20 to-orange-400/20 backdrop-blur-sm border border-yellow-300/50 p-4 rounded-2xl">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-semibold text-yellow-800">Commandes temporairement fermées</h3>
                <p className="text-sm text-yellow-700 mt-1">{orderDisabledReason}</p>
              </div>
            </div>
          </div>
        )}

        {/* Bouton de soumission */}
        <button
          type="submit"
          disabled={isSubmitting || orderDisabled}
          className={`w-full py-4 px-8 text-lg font-bold rounded-2xl transition-all duration-300 transform ${
            isSubmitting || orderDisabled
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-green-600 to-emerald-700 text-white hover:from-green-700 hover:to-emerald-800 hover:scale-[1.02] shadow-lg hover:shadow-xl active:scale-[0.98]'
          }`}
        >
          <span className="flex items-center justify-center">
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-current" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                Traitement en cours...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
                Confirmer la commande
              </>
            )}
          </span>
        </button>
      </form>
    </div>
  );
}