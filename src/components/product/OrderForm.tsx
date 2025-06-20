'use client';

import { useEffect, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { placeOrder } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
import { toast } from 'react-toastify';
import { Product, CreateOrderData } from '@/types';

interface OrderFormProps {
  product: Product;
}

export default function OrderForm({ product }: OrderFormProps) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<CreateOrderData>();
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loadingSchedules, setLoadingSchedules] = useState(true);

  useEffect(() => {
    if (!product?.seller?.id || !token) return;

    setLoadingSchedules(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/delivery_schedules/?farmer=${product.seller.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(setSchedules)
      .catch(() => toast.error('Erreur lors du chargement des créneaux'))
      .finally(() => setLoadingSchedules(false));
  }, [product.seller?.id, token]);

  const onSubmit: SubmitHandler<CreateOrderData> = async (data) => {
    if (!user || !token) {
      toast.error('Vous devez être connecté pour commander');
      return;
    }

    setIsSubmitting(true);
    try {
      await placeOrder(product.id, data, token);
      toast.success('Commande passée avec succès');
      reset(); // Réinitialise le formulaire après succès
    } catch (error: any) {
      toast.error(error?.message || 'Erreur lors de la commande');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
            }
          })}
          className="w-full p-2 border rounded"
        />
        {errors.quantity && <p className="text-red-500 text-sm">{errors.quantity.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Créneau de livraison</label>
        {loadingSchedules ? (
          <p className="text-gray-500 text-sm">Chargement des créneaux...</p>
        ) : (
          <select
            {...register('delivery_schedule_id', { required: 'Sélectionnez un créneau' })}
            className="w-full p-2 border rounded"
          >
            <option value="">-- Sélectionner --</option>
            {schedules.map(schedule => (
              <option key={schedule.id} value={schedule.id}>
                {schedule.day_of_week} : {schedule.start_time} - {schedule.end_time}
              </option>
            ))}
          </select>
        )}
        {errors.delivery_schedule_id && (
          <p className="text-red-500 text-sm">{errors.delivery_schedule_id.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 disabled:opacity-50"
      >
        {isSubmitting ? 'Traitement...' : 'Passer la commande'}
      </button>
    </form>
  );
}
