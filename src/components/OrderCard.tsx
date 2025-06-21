import Link from 'next/link';
import { Order } from '@/types';
import { getStatusColor, formatDate } from '@/utils/helpers';

interface OrderCardProps {
  order: Order;
  userRole: string;
}

export default function OrderCard({ order, userRole }: OrderCardProps) {
  const statusColor = getStatusColor(order.status);
  const isClient = userRole === 'client';
  const isFarmer = userRole === 'farmer' || userRole === 'admin';

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-semibold">Commande #{order.id}</h3>
            <p className="text-gray-600 mt-1">{order.product.name}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor}`}>
            {order.status}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-500">Quantité</p>
            <p className="font-medium">{order.quantity} unités</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Date</p>
            <p className="font-medium">{formatDate(order.created_at)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Prix</p>
            <p className="font-medium">{(order.product.price * order.quantity).toFixed(2)} €</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Vendeur</p>
            <p className="font-medium">{order.farmer.username}</p>
          </div>
        </div>

        <div className="flex justify-between items-center mt-4">
          <Link 
            href={`/orders/${order.id}`}
            className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            Voir détails
          </Link>
          
          {(isClient && order.status === 'pending') && (
            <span className="text-yellow-600 text-sm">En attente</span>
          )}
        </div>
      </div>
    </div>
  );
}