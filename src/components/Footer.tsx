'use client';

import { FiHeart } from 'react-icons/fi';
import { FaLeaf, FaFacebookF, FaTwitter, FaLinkedinIn, FaWhatsapp } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="bg-green-900 text-white pt-16 pb-8 px-6">
      <div className="max-w-7xl mx-auto grid gap-12 md:grid-cols-4">
        {/* Logo & Description */}
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl flex items-center justify-center">
              <FaLeaf className="text-white text-lg" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              AgriSmart
            </span>
          </div>
          <p className="text-gray-300 leading-relaxed text-sm">
            Révolutionnons ensemble l'agriculture béninoise avec des outils intelligents et une communauté engagée.
          </p>
        </div>

        {/* Plateforme */}
        <div>
          <h3 className="text-lg font-semibold mb-3 text-green-300">Plateforme</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li><a href="#" className="hover:text-white">Fonctionnalités</a></li>
            <li><a href="#" className="hover:text-white">Tarifs</a></li>
            <li><a href="#" className="hover:text-white">API</a></li>
            <li><a href="#" className="hover:text-white">Documentation</a></li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h3 className="text-lg font-semibold mb-3 text-green-300">Support</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li><a href="#" className="hover:text-white">Centre d'aide</a></li>
            <li><a href="#" className="hover:text-white">Contact</a></li>
            <li><a href="#" className="hover:text-white">Formation</a></li>
            <li><a href="#" className="hover:text-white">Communauté</a></li>
          </ul>
        </div>

        {/* Réseaux sociaux */}
        <div>
          <h3 className="text-lg font-semibold mb-3 text-green-300">Suivez-nous</h3>
          <div className="flex space-x-3">
            <a href="#" className="w-9 h-9 bg-green-600 rounded-full flex items-center justify-center hover:bg-green-500 transition">
              <FaFacebookF />
            </a>
            <a href="#" className="w-9 h-9 bg-green-600 rounded-full flex items-center justify-center hover:bg-green-500 transition">
              <FaTwitter />
            </a>
            <a href="#" className="w-9 h-9 bg-green-600 rounded-full flex items-center justify-center hover:bg-green-500 transition">
              <FaLinkedinIn />
            </a>
            <a href="#" className="w-9 h-9 bg-green-600 rounded-full flex items-center justify-center hover:bg-green-500 transition">
              <FaWhatsapp />
            </a>
          </div>
        </div>
      </div>

      {/* Ligne de copyright */}
      <div className="border-t border-green-700 mt-12 pt-6 text-center text-sm text-gray-300">
        <p className="flex justify-center items-center gap-2">
          © {new Date().getFullYear()} <strong>AgriSmart</strong> · Tous droits réservés
        </p>
        <p className="mt-1 flex justify-center items-center gap-2 opacity-75 text-xs">
          Fait avec <FiHeart className="text-red-400" /> au Bénin
        </p>
      </div>
    </footer>
  );
}
