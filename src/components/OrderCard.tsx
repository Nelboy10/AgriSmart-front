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

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'en cours de traitement':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
        );
      case 'confirmer':
      case 'approuver':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        );
      case 'livrer':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
            <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v8a1 1 0 001 1h2a1 1 0 001-1V8a1 1 0 00-1-1h-2z" />
          </svg>
        );
      case 'supprimer':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto group bg-gradient-to-br from-white via-gray-50/30 to-blue-50/20 dark:from-gray-800 dark:via-gray-900/30 dark:to-blue-900/20 backdrop-blur-sm border border-white/40 dark:border-gray-700 shadow-lg rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] transform">
      {/* Header */}
      <div className="relative p-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-800 dark:via-indigo-800 dark:to-purple-800">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/80 via-indigo-600/80 to-purple-600/80 dark:from-blue-800/80 dark:via-indigo-800/80 dark:to-purple-800/80 z-0"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between gap-2 md:items-center">
          <div className="min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <div className="bg-white/20 p-2 rounded-lg">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white truncate">
                Commande #{order.id}
              </h3>
            </div>
            <p className="text-blue-100 dark:text-blue-200 text-lg font-medium truncate">
              {order.product.name}
            </p>
          </div>

          <div className="flex-shrink-0">
            <span className={`inline-flex items-center px-4 py-2 rounded-2xl text-sm font-bold border backdrop-blur-sm ${statusColor}`}>
              {getStatusIcon(order.status)}
              <span className="ml-2 capitalize">{order.status}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {[
            {
              icon: 'M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z',
              label: 'Quantité',
              value: `${order.quantity} unités`,
              color: 'bg-green-500',
              textColor: 'text-gray-900 dark:text-white'
            },
            {
              icon: 'M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z',
              label: 'Date',
              value: formatDate(order.created_at),
              color: 'bg-blue-500',
              textColor: 'text-gray-900 dark:text-white'
            },
            {
              icon: 'M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z',
              label: 'Prix total',
              value: `${order.product.price * order.quantity} Fcfa`,
              color: 'bg-emerald-500',
              textColor: 'text-emerald-600 dark:text-emerald-400'
            },
            {
              icon: 'M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z',
              label: 'Vendeur',
              value: order.farmer.username,
              color: 'bg-purple-500',
              textColor: 'text-gray-900 dark:text-white'
            }
          ].map(({ icon, label, value, color, textColor }, i) => (
            <div key={i} className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm p-4 rounded-2xl border border-white/50 dark:border-gray-700/50 transition-all duration-300 hover:bg-white/80 dark:hover:bg-gray-700/80 min-w-0">
              <div className="flex items-center mb-2">
                <div className={`${color} p-2 rounded-lg mr-3`}>
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d={icon} />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">{label}</p>
              </div>
              <p className={`text-xl font-bold ml-11 truncate ${textColor}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Footer actions */}
        <div className="flex flex-wrap justify-between items-center gap-4 pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
          <Link
            href={`/orders/${order.id}`}
            className="group/link inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.05] transform"
          >
            <svg className="w-4 h-4 mr-2 group-hover/link:rotate-12 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
            </svg>
            Voir détails
          </Link>

          {(isClient && order.status === 'pending') && (
            <div className="flex items-center px-4 py-2 bg-yellow-100/40 dark:bg-yellow-900/30 border border-yellow-400/60 dark:border-yellow-600/60 rounded-2xl">
              <svg className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mr-2 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              <span className="text-yellow-700 dark:text-yellow-300 font-semibold text-sm">
                En attente de confirmation
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
