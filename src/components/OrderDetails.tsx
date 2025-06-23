import { Order, User } from '@/types';
import { formatDate, getStatusColor, getDayOfWeekName } from '@/utils/helpers';

interface OrderDetailsProps {
  order: Order;
  user: User | null;
  onApprove: () => void;
  onReject: () => void;
  onCancel: () => void;
  onConfirmDelivery: () => void;
  rejectionReason: string;
  setRejectionReason: (value: string) => void;
  notes: string;
  setNotes: (value: string) => void;
  actionLoading: boolean;
}

export default function OrderDetails({
  order,
  user,
  onApprove,
  onReject,
  onCancel,
  onConfirmDelivery,
  rejectionReason,
  setRejectionReason,
  notes,
  setNotes,
  actionLoading,
}: OrderDetailsProps) {
  const isClient = user?.role === 'client';
  const isFarmer = user?.role === 'farmer' || user?.role === 'admin';
  const statusColor = getStatusColor(order.status);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md overflow-hidden w-full max-w-7xl mx-auto">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="w-full">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white break-words">
              Commande #{order.id}
            </h1>
            <div className="flex flex-wrap items-center mt-2 gap-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColor}`}>
                {order.status}
              </span>
              <span className="text-gray-500 dark:text-gray-400 text-sm">
                {formatDate(order.created_at)}
              </span>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 w-full md:w-auto">
            <p className="text-lg font-semibold text-right text-gray-900 dark:text-white">
              {(order.product.price * order.quantity).toFixed(2)} €
            </p>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              {order.quantity} × {order.product.price.toFixed(2)} €
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
        {/* Détails de la commande */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Détails de la commande</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-700 dark:text-gray-300">Produit</h3>
              <p className="mt-1 text-gray-900 dark:text-white">{order.product.name}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-gray-700 dark:text-gray-300">Client</h3>
                <p className="mt-1 text-gray-900 dark:text-white">{order.client.username}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-700 dark:text-gray-300">Agriculteur</h3>
                <p className="mt-1 text-gray-900 dark:text-white">{order.farmer.username}</p>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-700 dark:text-gray-300">Livraison prévue</h3>
              {order.delivery_schedule ? (
                <div className="mt-1 text-gray-900 dark:text-white">
                  {order.delivery_schedule.delivery_date ? (
                    <p className="font-medium">{formatDate(order.delivery_schedule.delivery_date)}</p>
                  ) : (
                    <p>
                      {getDayOfWeekName(order.delivery_schedule.day_of_week)} : {order.delivery_schedule.start_time} - {order.delivery_schedule.end_time}
                    </p>
                  )}
                  <p className="text-sm text-gray-500 dark:text-gray-400">{order.delivery_schedule.location}</p>
                </div>
              ) : (
                <p className="mt-1 text-gray-600 dark:text-gray-400">Non spécifiée</p>
              )}
            </div>

            {order.rejection_reason && (
              <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded">
                <h3 className="font-medium text-red-700 dark:text-red-400">Raison du rejet</h3>
                <p className="mt-1 text-red-600 dark:text-red-300">{order.rejection_reason}</p>
              </div>
            )}
          </div>

          {/* Actions */}
          {(isFarmer || isClient) && (
            <div className="mt-8 space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Actions</h2>

              {isFarmer && order.status === 'pending' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes (optionnel)</label>
                    <textarea
                      className="w-full p-2 border rounded-md bg-white dark:bg-gray-800 dark:text-white"
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Ajouter des notes..."
                    />
                    <button
                      onClick={onApprove}
                      disabled={actionLoading}
                      className="w-full mt-2 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md disabled:opacity-50"
                    >
                      {actionLoading ? 'Traitement...' : 'Approuver la commande'}
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Raison du rejet *</label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded-md bg-white dark:bg-gray-800 dark:text-white"
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Pourquoi rejetez-vous cette commande ?"
                      required
                    />
                    <button
                      onClick={onReject}
                      disabled={actionLoading || !rejectionReason}
                      className="w-full mt-2 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md disabled:opacity-50"
                    >
                      {actionLoading ? 'Traitement...' : 'Rejeter la commande'}
                    </button>
                  </div>
                </div>
              )}

              {isClient && ['pending', 'approved'].includes(order.status) && (
                <button
                  onClick={onCancel}
                  disabled={actionLoading}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md disabled:opacity-50"
                >
                  {actionLoading ? 'Annulation en cours...' : 'Annuler la commande'}
                </button>
              )}

              {order.status === 'approved' && (
                <button
                  onClick={onConfirmDelivery}
                  disabled={actionLoading}
                  className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md disabled:opacity-50"
                >
                  {actionLoading ? 'Confirmation...' : 'Confirmer la livraison'}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Historique des statuts */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Historique</h2>

          {(order.status_history?.length ?? 0) > 0 ? (
            <div className="space-y-4">
              {(order.status_history ?? []).map(update => (
                <div key={update.id} className="border-l-4 border-blue-500 pl-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-r">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {update.previous_status} → {update.new_status}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(update.created_at)}
                    </span>
                  </div>
                  <p className="text-sm mt-1 text-gray-700 dark:text-gray-300">Par: {update.changed_by.username}</p>
                  {update.notes && <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Notes: {update.notes}</p>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">Aucun historique disponible</p>
          )}

          {order.delivery_confirmation && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Confirmation de livraison</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 dark:bg-green-900/10 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-800 dark:text-white">Client</h3>
                  <p className="mt-1">
                    {order.delivery_confirmation.confirmed_by_client
                      ? <span className="text-green-600">Confirmé</span>
                      : <span className="text-yellow-600">En attente</span>}
                  </p>
                  {order.delivery_confirmation.client_confirmation_date && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {formatDate(order.delivery_confirmation.client_confirmation_date)}
                    </p>
                  )}
                </div>
                <div className="bg-green-50 dark:bg-green-900/10 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-800 dark:text-white">Agriculteur</h3>
                  <p className="mt-1">
                    {order.delivery_confirmation.confirmed_by_farmer
                      ? <span className="text-green-600">Confirmé</span>
                      : <span className="text-yellow-600">En attente</span>}
                  </p>
                  {order.delivery_confirmation.farmer_confirmation_date && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {formatDate(order.delivery_confirmation.farmer_confirmation_date)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
