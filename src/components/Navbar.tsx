'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FiSun, FiMoon } from 'react-icons/fi';

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 
        ${isScrolled ? 'backdrop-blur-md shadow-lg' : ''} 
        ${theme === 'dark' 
          ? 'bg-gray-900/80 text-white' 
          : 'bg-green-50/80 text-green-900'} 
        py-3`}
    >
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          
          {/* Logo */}
          <Link
            href="/"
            className="text-2xl font-bold flex items-center gap-2 transition-transform duration-300 hover:scale-105"
          >
            <span className="text-3xl">🌾</span>
            <span className="hidden sm:inline-block bg-gradient-to-r from-green-600 to-lime-400 bg-clip-text text-transparent hover:underline decoration-2 underline-offset-4">
              AgriSmart
            </span>
          </Link>

          {/* Boutons à droite */}
          <div className="flex items-center gap-4">
            {/* Bouton Se connecter */}
            <Link href="/auth/login">
              <button
                className={`px-4 py-2 rounded-full font-medium transition duration-300 shadow 
                  ${theme === 'dark' 
                    ? 'bg-white text-gray-900 hover:bg-gray-100' 
                    : 'bg-green-600 text-white hover:bg-green-700'}
                `}
              >
                Se connecter
              </button>
            </Link>

            {/* Bouton Thème */}
            {mounted && (
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                aria-label="Changer le thème"
                className={`p-2 rounded-full transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-110
                  ${theme === 'dark' 
                    ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200' 
                    : 'bg-gray-800 text-yellow-300 hover:bg-gray-700'}`}
              >
                {theme === 'dark' ? (
                  <FiSun className="text-xl" />
                ) : (
                  <FiMoon className="text-xl" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
