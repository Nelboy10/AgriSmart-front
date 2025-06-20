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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="bg-blue-50 p-4 rounded-lg mb-4">
        <h3 className="font-semibold text-blue-800">Information de livraison</h3>
        <p className="text-sm">
          Livraison prévue le: <span className="font-medium">{deliveryDate || 'calcul en cours...'}</span>
        </p>
        <p className="text-sm">
          Lieu: <span className="font-medium">Quartier Zongo</span>
        </p>
        <p className="text-sm">
          Horaires: <span className="font-medium">08:00 - 14:00</span>
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Quantité (max: {product.available_quantity})
        </label>
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
          className="w-full p-2 border rounded"
          disabled={orderDisabled}
        />
        {errors.quantity && <p className="text-red-500 text-sm">{errors.quantity.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Notes pour l'agriculteur (optionnel)
        </label>
        <textarea
          {...register('client_notes')} 
          className="w-full p-2 border rounded"
          rows={3}
          placeholder="Des instructions spécifiques pour la livraison..."
          disabled={orderDisabled}
        />
      </div>

      {orderDisabled && (
        <div className="bg-yellow-50 p-3 rounded-md text-yellow-700 text-sm">
          {orderDisabledReason}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting || orderDisabled}
        className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 disabled:opacity-50 w-full"
      >
        {isSubmitting ? 'Traitement...' : 'Passer la commande'}
      </button>
    </form>
  );
}