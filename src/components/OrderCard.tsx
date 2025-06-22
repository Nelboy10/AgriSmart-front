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

  // Définir l'icône et la couleur en fonction du statut
  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
          </svg>
        );
      case 'confirmed':
      case 'approved':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
          </svg>
        );
      case 'delivered':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
            <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v8a1 1 0 001 1h2a1 1 0 001-1V8a1 1 0 00-1-1h-2z"/>
          </svg>
        );
      case 'cancelled':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
          </svg>
        );
    }
  };

  return (
    <div className="group bg-gradient-to-br from-white via-gray-50/30 to-blue-50/20 backdrop-blur-sm border border-white/40 shadow-xl shadow-gray-900/5 rounded-3xl overflow-hidden hover:shadow-2xl hover:shadow-blue-900/10 transition-all duration-500 hover:scale-[1.02] transform">
      {/* Header avec gradient */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/80 via-indigo-600/80 to-purple-600/80"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
        
        <div className="relative flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center mb-2">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2 mr-3">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white">
                Commande #{order.id}
              </h3>
            </div>
            <p className="text-blue-100 text-lg font-medium ml-12">
              {order.product.name}
            </p>
          </div>
          
          <div className="flex flex-col items-end">
            <span className={`inline-flex items-center px-4 py-2 rounded-2xl text-sm font-bold backdrop-blur-sm border border-white/30 ${statusColor}`}>
              {getStatusIcon(order.status)}
              <span className="ml-2 capitalize">{order.status}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="p-6">
        {/* Grille d'informations */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          {/* Quantité */}
          <div className="bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-white/50 hover:bg-white/80 transition-all duration-300">
            <div className="flex items-center mb-2">
              <div className="bg-green-500 rounded-lg p-2 mr-3">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"/>
                </svg>
              </div>
              <p className="text-sm font-semibold text-gray-600">Quantité</p>
            </div>
            <p className="text-xl font-bold text-gray-900 ml-11">{order.quantity} unités</p>
          </div>

          {/* Date */}
          <div className="bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-white/50 hover:bg-white/80 transition-all duration-300">
            <div className="flex items-center mb-2">
              <div className="bg-blue-500 rounded-lg p-2 mr-3">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
                </svg>
              </div>
              <p className="text-sm font-semibold text-gray-600">Date</p>
            </div>
            <p className="text-xl font-bold text-gray-900 ml-11">{formatDate(order.created_at)}</p>
          </div>

          {/* Prix */}
          <div className="bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-white/50 hover:bg-white/80 transition-all duration-300">
            <div className="flex items-center mb-2">
              <div className="bg-emerald-500 rounded-lg p-2 mr-3">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"/>
                </svg>
              </div>
              <p className="text-sm font-semibold text-gray-600">Prix total</p>
            </div>
            <p className="text-xl font-bold text-emerald-600 ml-11">
              {(order.product.price * order.quantity).toFixed(2)} €
            </p>
          </div>

          {/* Vendeur */}
          <div className="bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-white/50 hover:bg-white/80 transition-all duration-300">
            <div className="flex items-center mb-2">
              <div className="bg-purple-500 rounded-lg p-2 mr-3">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                </svg>
              </div>
              <p className="text-sm font-semibold text-gray-600">Vendeur</p>
            </div>
            <p className="text-xl font-bold text-gray-900 ml-11">{order.farmer.username}</p>
          </div>
        </div>

        {/* Actions footer */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-200/50">
          <Link 
            href={`/orders/${order.id}`}
            className="group/link inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.05] transform"
          >
            <svg className="w-4 h-4 mr-2 group-hover/link:rotate-12 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
            </svg>
            Voir détails
          </Link>
          
          {(isClient && order.status === 'pending') && (
            <div className="flex items-center px-4 py-2 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 backdrop-blur-sm border border-yellow-300/50 rounded-2xl">
              <svg className="w-4 h-4 text-yellow-600 mr-2 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
              </svg>
              <span className="text-yellow-700 font-semibold text-sm">En attente de confirmation</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}