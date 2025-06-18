'use client';

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { placeOrder } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-toastify';
import { Product, CreateOrderData } from '@/types';

interface OrderFormProps {
  product: Product;
}

export default function OrderForm({ product }: OrderFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<CreateOrderData>();
  const { user, token } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit: SubmitHandler<CreateOrderData> = async (data) => {
    if (!user) {
      toast.error('You must be logged in to place an order');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await placeOrder(product.id, data, token!);
      toast.success('Order placed successfully!');
      // Handle redirection or UI update
    } catch (error) {
      toast.error('Error placing order');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">
          Quantity (max: {product.available_quantity})
        </label>
        <input
          type="number"
          min="1"
          max={product.available_quantity}
          {...register('quantity', { 
            required: 'This field is required',
            max: {
              value: product.available_quantity,
              message: 'Insufficient stock'
            }
          })}
          className="w-full p-2 border rounded"
        />
        {errors.quantity && (
          <p className="text-red-500 text-sm mt-1">{errors.quantity.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 disabled:opacity-50"
      >
        {isSubmitting ? 'Processing...' : 'Place Order'}
      </button>
    </form>
  );
}