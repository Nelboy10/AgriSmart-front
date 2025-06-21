'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  fetchOrderDetail, 
  approveOrder, 
  rejectOrder, 
  cancelOrder,
  confirmDelivery
} from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
import OrderDetails from '@/components/OrderDetails';
import { toast } from 'react-toastify';
import { Order, User } from '@/types'; // Import depuis types

export default function OrderDetailPage() {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [notes, setNotes] = useState('');
  
  const params = useParams();
  const router = useRouter();
  const { token, user } = useAuthStore();

  // Gestion robuste de l'ID
  const orderId = Array.isArray(params.id) ? params.id[0] : params.id;

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }

    // Vérification que l'ID est défini
    if (!orderId) {
      toast.error('Identifiant de commande invalide');
      setLoading(false);
      return;
    }

    const loadOrder = async () => {
      try {
        setLoading(true);
        const data = await fetchOrderDetail(orderId, token);
        setOrder(data);
      } catch (err) {
        console.error(err);
        toast.error('Erreur lors du chargement de la commande');
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [orderId, token, router]);

  const handleApprove = async () => {
    if (!token || !order) return;
    
    try {
      setActionLoading(true);
      await approveOrder(order.id, token, notes);
      toast.success('Commande approuvée avec succès');
      
      // Rafraîchir avec l'ID de l'objet order
      const updatedOrder = await fetchOrderDetail(order.id.toString(), token);
      setOrder(updatedOrder);
      setNotes('');
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de l\'approbation de la commande');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!token || !order) return;
    
    try {
      setActionLoading(true);
      await rejectOrder(order.id, token, rejectionReason, notes);
      toast.success('Commande rejetée avec succès');
      
      // Rafraîchir avec l'ID de l'objet order
      const updatedOrder = await fetchOrderDetail(order.id.toString(), token);
      setOrder(updatedOrder);
      setRejectionReason('');
      setNotes('');
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors du rejet de la commande');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!token || !order) return;
    
    try {
      setActionLoading(true);
      await cancelOrder(order.id, token);
      toast.success('Commande annulée avec succès');
      
      // Rafraîchir avec l'ID de l'objet order
      const updatedOrder = await fetchOrderDetail(order.id.toString(), token);
      setOrder(updatedOrder);
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de l\'annulation de la commande');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmDelivery = async () => {
    if (!token || !order) return;
    
    try {
      setActionLoading(true);
      await confirmDelivery(order.id, token);
      toast.success('Livraison confirmée avec succès');
      
      // Rafraîchir avec l'ID de l'objet order
      const updatedOrder = await fetchOrderDetail(order.id.toString(), token);
      setOrder(updatedOrder);
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la confirmation de livraison');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="text-center py-8">Chargement...</div>;
  if (!order) return <div className="text-center py-8">Commande non trouvée</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <OrderDetails 
        order={order}
        user={user as User | null} // Correction du type User
        onApprove={handleApprove}
        onReject={handleReject}
        onCancel={handleCancel}
        onConfirmDelivery={handleConfirmDelivery}
        rejectionReason={rejectionReason}
        setRejectionReason={setRejectionReason}
        notes={notes}
        setNotes={setNotes}
        actionLoading={actionLoading}
      />
    </div>
  );
}