import { Order } from '@/types';





export const canCancelOrder = (order: Order, userId: number) => {
  return order.client.id === userId && 
         ['pending', 'approved'].includes(order.status);
};

export const canApproveOrRejectOrder = (order: Order, userId: number, role: string) => {
  return (order.farmer.id === userId || role === 'admin') && 
         order.status === 'pending';
};

export const canConfirmDelivery = (order: Order, userId: number) => {
  return (order.client.id === userId || order.farmer.id === userId) && 
         order.status === 'approved';
};



// utils/helpers.ts
export const getDayOfWeekName = (dayOfWeek: number): string => {
  const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  return days[dayOfWeek] || 'Jour inconnu';
};

export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    case 'approved': return 'bg-green-100 text-green-800';
    case 'rejected': return 'bg-red-100 text-red-800';
    case 'canceled': return 'bg-gray-100 text-gray-800';
    case 'delivered': return 'bg-blue-100 text-blue-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};