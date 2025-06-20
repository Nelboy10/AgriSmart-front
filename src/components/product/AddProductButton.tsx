'use client';

import Link from 'next/link';
import { PlusIcon } from '@/components/icons';
import { useAuthStore } from '@/stores/auth-store';

export default function AddProductButton() {
  const user = useAuthStore((state) => state.user);

  if (!user || (user.role !== 'admin' && user.role !== 'farmer')) {
    return null; // N'affiche rien si non admin ou non farmer
  }

  return (
    <Link
      href="/products/create"
      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center"
    >
      <PlusIcon className="w-5 h-5 mr-1" />
      Ajouter un produit
    </Link>
  );
}
