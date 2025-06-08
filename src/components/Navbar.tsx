'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';
import { FiSun, FiMoon, FiMenu, FiX, FiLogOut } from 'react-icons/fi';
import { FaLeaf, FaUserCircle } from 'react-icons/fa';
import { useAuthStore } from '@/stores/auth-store';

interface User {
  id: number;
  username: string;
  email: string;
  photo?: string;
  first_name?: string;
  last_name?: string;
}


// Composant UserAvatar
function UserAvatar({ user, size = 'md' }: { user: User | null; size?: 'sm' | 'md' | 'lg' }) {
  if (!user) return null;

  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-lg',
    lg: 'w-16 h-16 text-2xl'
  };

  const baseClasses = `rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center font-bold text-green-700 dark:text-green-300 border-2 border-green-200 dark:border-green-700 hover:ring-2 hover:ring-green-300 transition`;

  return (
    <div className={`${baseClasses} ${sizeClasses[size]}`}>
      {user.photo ? (
        <img
          src={user.photo}
          alt="Photo de profil"
          className="w-full h-full rounded-full object-cover"
        />
      ) : (
        <span>{user.username[0]?.toUpperCase()}</span>
      )}
    </div>
  );
}

// Composant ProfileMenu
function ProfileMenu({ user, onClose }: { user: User; onClose?: () => void }) {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  
  const displayName = user?.first_name 
    ? `${user.first_name} ${user.last_name || ''}`.trim() 
    : user?.username || '';

  const handleLogout = () => {
    logout();
    onClose?.();
    router.push('/auth/login');
  };

  return (
    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50 animate-fade-in">
      <div className="px-4 py-3 text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <div className="mb-2 flex justify-center">
            <UserAvatar user={user} size="lg" />
          </div>
          <h3 className="font-semibold text-lg">{displayName}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
        </div>
      </div>
      
      <Link
        href={`/profile/${user.id}`}
        className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-green-50 dark:hover:bg-gray-700 transition"
        onClick={onClose}
      >
        <FaUserCircle className="mr-2 text-green-600 dark:text-green-400" />
        Mon profil
      </Link>
      
      <button
        onClick={handleLogout}
        className="w-full flex items-center px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
      >
        <FiLogOut className="mr-2" />
        Déconnexion
      </button>
    </div>
  );
}

// Composant de rendu conditionnel pour éviter l'hydratation mismatch
function AuthSection() {
  const { user, isAuthenticated, loading, initialized } = useAuthStore();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Gestion du clic à l'extérieur
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    }

    if (profileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [profileMenuOpen]);

  const displayName = user?.first_name 
    ? `${user.first_name} ${user.last_name || ''}`.trim() 
    : user?.username || '';

  // Pendant le chargement initial (avant hydratation)
  if (!initialized) {
    return (
      <div className="w-24 h-10 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
    );
  }

  // Pendant le chargement des données utilisateur
  if (loading) {
    return (
      <div className="w-20 h-10 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
    );
  }

  // Utilisateur connecté
  if (isAuthenticated && user) {
    return (
      <div className="relative" ref={profileMenuRef}>
        <button
          onClick={() => setProfileMenuOpen(!profileMenuOpen)}
          className="flex items-center space-x-2 focus:outline-none p-1 rounded-full transition hover:bg-gray-100 dark:hover:bg-gray-800"
          aria-label="Menu utilisateur"
          title="Profil"
        >
          <UserAvatar user={user} />
          <span className="hidden lg:inline-block font-medium text-gray-900 dark:text-gray-100">{displayName}</span>
        </button>

        {profileMenuOpen && (
          <ProfileMenu 
            user={user} 
            onClose={() => setProfileMenuOpen(false)} 
          />
        )}
      </div>
    );
  }

  // Utilisateur non connecté
  return (
    <Link
      href="/auth/login"
      className="bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-2 rounded-full text-white hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-md hover:shadow-lg text-sm font-medium"
    >
      Se connecter
    </Link>
  );
}

// Composant AuthSection pour mobile
function MobileAuthSection({ onMenuClose }: { onMenuClose: () => void }) {
  const { user, isAuthenticated, loading, initialized } = useAuthStore();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const displayName = user?.first_name 
    ? `${user.first_name} ${user.last_name || ''}`.trim() 
    : user?.username || '';

  // Pendant le chargement initial
  if (!initialized || loading) {
    return (
      <div className="flex justify-center">
        <div className="w-20 h-10 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
      </div>
    );
  }

  // Utilisateur connecté
  if (isAuthenticated && user) {
    return (
      <div className="flex items-center justify-center mb-4" ref={profileMenuRef}>
        <button
          onClick={() => setProfileMenuOpen(!profileMenuOpen)}
          className="flex items-center space-x-2 focus:outline-none p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          title="Profil"
        >
          <UserAvatar user={user} />
          <span className="font-medium text-gray-900 dark:text-gray-100">{displayName}</span>
        </button>
        {profileMenuOpen && (
          <ProfileMenu 
            user={user} 
            onClose={() => {
              setProfileMenuOpen(false);
              onMenuClose();
            }} 
          />
        )}
      </div>
    );
  }

  // Utilisateur non connecté
  return (
    <Link
      href="/auth/login"
      onClick={onMenuClose}
      className="block w-full text-center bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-2 rounded-full text-white hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-md hover:shadow-lg text-sm font-medium"
    >
      Se connecter
    </Link>
  );
}

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const { initializeAuth, initialized } = useAuthStore();
  
  // États locaux
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Initialisation côté client uniquement
  useEffect(() => {
    setMounted(true);
    
    // Initialiser l'auth seulement si pas encore hydraté
    if (!initialized) {
      initializeAuth();
    }
  }, [initialized, initializeAuth]);

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  return (
    <>
      {/* CORRECTION PRINCIPALE : Utilisation des classes Tailwind CSS au lieu de la logique conditionnelle */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-gray-900/90 text-gray-900 dark:text-white backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl flex items-center justify-center">
              <FaLeaf className="text-white text-lg" />
            </div>
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent">
              AgriSmart
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8 items-center">
            <Link href="/forum" className="text-gray-700 dark:text-gray-300 hover:text-green-500 dark:hover:text-green-400 transition-colors duration-300">
              Forum
            </Link>
            <Link href="/articles" className="text-gray-700 dark:text-gray-300 hover:text-green-500 dark:hover:text-green-400 transition-colors duration-300">
              Articles
            </Link>
            <Link href="/blog" className="text-gray-700 dark:text-gray-300 hover:text-green-500 dark:hover:text-green-400 transition-colors duration-300">
              Blog
            </Link>

            {/* Section Auth/Profile */}
            <div className="flex items-center space-x-4">
              <AuthSection />

              {/* Theme Toggle */}
              {mounted && (
                <button
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  aria-label="Changer le thème"
                  className="p-2 rounded-full transition duration-300 shadow hover:shadow-lg hover:scale-110 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  {theme === 'dark' ? (
                    <FiSun className="text-lg text-yellow-500" />
                  ) : (
                    <FiMoon className="text-lg text-blue-600" />
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              aria-label="Ouvrir le menu"
              className="text-2xl focus:outline-none text-gray-700 dark:text-gray-300"
            >
              {mobileMenuOpen ? <FiX /> : <FiMenu />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden px-6 pb-4 space-y-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
            <Link 
              href="/forum" 
              onClick={toggleMobileMenu} 
              className="block hover:text-green-500 dark:hover:text-green-400 py-2 text-gray-700 dark:text-gray-300"
            >
              Forum
            </Link>
            <Link 
              href="/articles" 
              onClick={toggleMobileMenu} 
              className="block hover:text-green-500 dark:hover:text-green-400 py-2 text-gray-700 dark:text-gray-300"
            >
              Articles
            </Link>
            <Link 
              href="/blog" 
              onClick={toggleMobileMenu} 
              className="block hover:text-green-500 dark:hover:text-green-400 py-2 text-gray-700 dark:text-gray-300"
            >
              Blog 
            </Link>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <MobileAuthSection onMenuClose={() => setMobileMenuOpen(false)} />

              {/* Theme Toggle Mobile */}
              {mounted && (
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => {
                      setTheme(theme === 'dark' ? 'light' : 'dark');
                      toggleMobileMenu();
                    }}
                    className="w-full flex items-center justify-center gap-2 p-3 rounded-lg transition bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                  >
                    {theme === 'dark' ? (
                      <FiSun className="text-yellow-500" />
                    ) : (
                      <FiMoon className="text-blue-600" />
                    )}
                    <span>Basculer en mode {theme === 'dark' ? 'clair' : 'sombre'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Styles */}
      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.18s cubic-bezier(.4,0,.2,1);
        }
      `}</style>
    </>
  );
}