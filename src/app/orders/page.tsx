'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchOrders } from '@/lib/api';
import { useAuthStore, useAuthInitialization } from '@/stores/auth-store';
import OrderCard from '@/components/OrderCard';
import { Order } from '@/types';

export default function OrdersPage() {
  useAuthInitialization(); // <- Important pour charger le token si présent dans localStorage

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token, isAuthenticated, user, initialized } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!initialized) return; // attendre l'initialisation complète

    if (!token) {
      router.push('/auth/login');
      return;
    }

    const loadOrders = async () => {
      try {
        setLoading(true);
        const data = await fetchOrders(token);
        setOrders(data);
      } catch (err) {
        setError('Erreur lors du chargement des commandes');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [token, router, initialized]);

  if (!initialized) {
    return <div className="text-center py-8">Initialisation...</div>;
  }

  if (loading) return <div className="text-center py-8">Chargement...</div>;
  if (error) return <div className="text-red-500 text-center py-8">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Mes Commandes</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {orders.map(order => (
          <OrderCard
            key={order.id}
            order={order}
            userRole={user?.role || 'client'}
          />
        ))}
      </div>

      {orders.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Aucune commande trouvée</p>
        </div>
      )}
    </div>
  );
}
