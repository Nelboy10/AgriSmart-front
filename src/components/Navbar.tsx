'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { FiSun, FiMoon, FiMenu, FiX } from 'react-icons/fi';
import { FaLeaf } from 'react-icons/fa';

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 
        ${isScrolled ? 'shadow-sm backdrop-blur-md' : ''} 
        ${theme === 'dark' ? 'bg-gray-900/80 text-white' : 'bg-white/90 text-green-900'}
      `}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl flex items-center justify-center">
            <FaLeaf className="text-white text-lg" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent">
            AgriSmart
          </span>
        </div>

        {/* Liens desktop */}
        <div className="hidden md:flex space-x-8 items-center">
          <a href="#about" className="hover:text-green-500 transition-colors duration-300">À propos</a>
          <a href="#features" className="hover:text-green-500 transition-colors duration-300">Fonctionnalités</a>
          <a href="#contact" className="hover:text-green-500 transition-colors duration-300">Contact</a>

          <Link href="/auth/login">
            <button className="bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-2 rounded-full text-white hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-md hover:shadow-lg text-sm font-medium">
              Se connecter
            </button>
          </Link>

          {mounted && (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label="Changer le thème"
              className={`p-2 rounded-full transition duration-300 shadow hover:shadow-lg hover:scale-110
                ${theme === 'dark'
                  ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                  : 'bg-gray-800 text-yellow-300 hover:bg-gray-700'}`}
            >
              {theme === 'dark' ? <FiSun className="text-lg" /> : <FiMoon className="text-lg" />}
            </button>
          )}
        </div>

        {/* Bouton menu mobile */}
        <div className="md:hidden">
          <button
            onClick={toggleMobileMenu}
            aria-label="Ouvrir le menu"
            className="text-2xl focus:outline-none"
          >
            {mobileMenuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>

      {/* Menu Mobile */}
      {mobileMenuOpen && (
        <div className={`md:hidden px-6 pb-4 space-y-4`}>
          <a href="#about" onClick={toggleMobileMenu} className="block hover:text-green-500">À propos</a>
          <a href="#features" onClick={toggleMobileMenu} className="block hover:text-green-500">Fonctionnalités</a>
          <a href="#contact" onClick={toggleMobileMenu} className="block hover:text-green-500">Contact</a>

          <Link href="/auth/login" onClick={toggleMobileMenu}>
            <button className="w-full bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-2 rounded-full text-white hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-md hover:shadow-lg text-sm font-medium">
              Se connecter
            </button>
          </Link>

          {mounted && (
            <button
              onClick={() => {
                setTheme(theme === 'dark' ? 'light' : 'dark');
                toggleMobileMenu();
              }}
              className={`w-full flex items-center justify-center gap-2 p-2 rounded-full transition duration-300 shadow hover:shadow-lg
                ${theme === 'dark'
                  ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                  : 'bg-gray-800 text-yellow-300 hover:bg-gray-700'}`}
            >
              {theme === 'dark' ? <FiSun className="text-lg" /> : <FiMoon className="text-lg" />}
              <span>Thème</span>
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
