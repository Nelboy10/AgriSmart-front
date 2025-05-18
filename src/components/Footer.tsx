'use client';

import { FiHeart } from 'react-icons/fi';

export default function Footer() {
  return (
    <footer className="w-full text-center py-6 bg-green-800 text-white flex flex-col items-center gap-2">
      <p className="flex items-center gap-1">
        © {new Date().getFullYear()} <span className="font-semibold">AgriSmart</span> · Tous droits réservés
      </p>
      <p className="text-sm flex items-center gap-1 opacity-80">
        Fait avec <FiHeart className="text-red-400" /> au Bénin
      </p>
    </footer>
  );
}
