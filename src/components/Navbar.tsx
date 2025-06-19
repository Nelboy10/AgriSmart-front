'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { 
  Sun, 
  Moon, 
  Menu, 
  LogOut, 
  User,
  Leaf,
  MessageSquare,
  BookOpen,
  Command,
  Monitor,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';

interface User {
  id: number;
  username: string;
  email: string;
  photo?: string;
  first_name?: string;
  last_name?: string;
}

// Configuration des liens de navigation avec icônes
const navigationLinks = [
  { 
    href: '/discussions', 
    label: 'Discussions', 
    icon: MessageSquare,
    description: 'Discussions et échanges'
  },
  { 
    href: '/products', 
    label: 'Catalogue', 
    icon: Command,
    description: 'Catalogue'
  },
  { 
    href: '/blog', 
    label: 'Blog Agricole', 
    icon: BookOpen,
    description: 'Blog Agricole'
  },
];

// Composant Toggle de Thème Amélioré
function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-10 w-10 md:h-9 md:w-9">
        <div className="h-5 w-5 md:h-4 md:w-4 animate-pulse rounded bg-muted" />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-10 w-10 md:h-9 md:w-9">
          <Sun className="h-5 w-5 md:h-4 md:w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 md:h-4 md:w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Changer le thème</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <Sun className="mr-2 h-4 w-4" />
          Clair
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <Moon className="mr-2 h-4 w-4" />
          Sombre
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          <Monitor className="mr-2 h-4 w-4" />
          Système
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Composant Avatar utilisateur
function UserAvatar({ user, size = 'default' }: { user: User; size?: 'sm' | 'default' | 'lg' }) {
  const displayName = user?.first_name 
    ? `${user.first_name} ${user.last_name || ''}`.trim() 
    : user?.username || '';

  const initials = displayName
    .split(' ')
    .map(name => name[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const sizeClasses = {
    sm: 'h-6 w-6',
    default: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  return (
    <Avatar className={sizeClasses[size]}>
      <AvatarImage src={user.photo} alt={`Photo de ${displayName}`} />
      <AvatarFallback className="bg-gradient-to-br from-green-400 to-emerald-600 text-white font-semibold">
        {initials || user.username[0]?.toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );
}

// Menu utilisateur desktop
function UserMenu({ user }: { user: User }) {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  
  const displayName = user?.first_name 
    ? `${user.first_name} ${user.last_name || ''}`.trim() 
    : user?.username || '';

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-auto p-1 rounded-full hover:bg-accent">
          <div className="flex items-center space-x-2">
            <UserAvatar user={user} />
            <span className="hidden lg:inline-block text-sm font-medium">
              {displayName}
            </span>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex items-center space-x-3 p-2">
            <UserAvatar user={user} size="lg" />
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{displayName}</p>
              <p className="text-xs leading-none text-muted-foreground truncate">
                {user.email}
              </p>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={`/profile/${user.id}`} className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            <span>Mon profil</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Déconnexion</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Section authentification
function AuthSection() {
  const { user, isAuthenticated, loading, initialized } = useAuthStore();

  // Pendant le chargement initial
  if (!initialized || loading) {
    return (
      <div className="h-8 w-20 animate-pulse rounded-full bg-muted"></div>
    );
  }

  // Utilisateur connecté
  if (isAuthenticated && user) {
    return <UserMenu user={user} />;
  }

  // Utilisateur non connecté
  return (
    <Button asChild className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-md hover:shadow-lg">
      <Link href="/auth/login">Se connecter</Link>
    </Button>
  );
}

// Section Auth pour mobile dans le drawer
function MobileAuthSection({ user, isAuthenticated, onClose }: { 
  user: User | null; 
  isAuthenticated: boolean; 
  onClose: () => void; 
}) {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);

  const displayName = user?.first_name 
    ? `${user.first_name} ${user.last_name || ''}`.trim() 
    : user?.username || '';

  const handleLogout = () => {
    logout();
    onClose();
    router.push('/auth/login');
  };

  if (isAuthenticated && user) {
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-3 p-4 rounded-lg bg-muted/50">
          <UserAvatar user={user} size="lg" />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{displayName}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
        </div>
        
        <div className="space-y-2">
          <Link
            href={`/profile/${user.id}`}
            onClick={onClose}
            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <User className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium">Mon profil</span>
          </Link>
          
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors text-red-600 w-full text-left"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Déconnexion</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <Button 
      asChild 
      className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
      onClick={onClose}
    >
      <Link href="/auth/login">Se connecter</Link>
    </Button>
  );
}

// Composant principal Navbar
export default function Navbar() {
  const { user, isAuthenticated, initializeAuth, initialized } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Initialisation côté client
  useEffect(() => {
    setMounted(true);
    if (!initialized) {
      initializeAuth();
    }
  }, [initialized, initializeAuth]);

  // Éviter les erreurs d'hydratation
  if (!mounted) {
    return (
      <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center px-4 sm:px-6">
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-green-400 to-emerald-600">
              <Leaf className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent">
              AgriSmart
            </span>
          </div>
          <div className="ml-auto">
            <div className="h-8 w-20 animate-pulse rounded-full bg-muted"></div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto max-w-5xl flex h-16 items-center px-4 sm:px-6">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-gradient-to-br from-green-400 to-emerald-600">
            <Leaf className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
          </div>
          <Link href="/" className="text-lg sm:text-xl font-bold bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent">
            AgriSmart
          </Link>
        </div>

        {/* Navigation desktop */}
        <nav className="hidden md:flex items-center space-x-1 ml-6 lg:ml-8">
          {navigationLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <link.icon className="h-4 w-4" />
              <span>{link.label}</span>
            </Link>
          ))}
        </nav>

        {/* Actions à droite */}
        <div className="ml-auto flex items-center space-x-2">
          {/* Auth section desktop */}
          <div className="hidden md:flex">
            <AuthSection />
          </div>
          
          {/* Theme toggle avec menu dropdown */}
          <ThemeToggle />

          {/* Mobile menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden h-10 w-10">
                <Menu className="h-15 w-15" />
                <span className="sr-only">Ouvrir le menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[350px]">
              <SheetHeader>
                <SheetTitle className="flex items-center space-x-2 text-left">
                  <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-green-400 to-emerald-600">
                    <Leaf className="h-3 w-3 text-white" />
                  </div>
                  <span className="bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent">
                    AgriSmart
                  </span>
                </SheetTitle>
              </SheetHeader>
              
              <div className="mt-8 space-y-6">
                {/* Navigation mobile */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground px-3">Navigation</h3>
                  {navigationLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <link.icon className="h-5 w-5 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="font-medium">{link.label}</p>
                        <p className="text-xs text-muted-foreground">{link.description}</p>
                      </div>
                    </Link>
                  ))}
                </div>

                <Separator />

                {/* Section Auth mobile */}
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground px-3 mb-3">Compte</h3>
                  <MobileAuthSection 
                    user={user} 
                    isAuthenticated={isAuthenticated} 
                    onClose={() => setMobileMenuOpen(false)} 
                  />
                </div>

                <Separator />

                {/* Section Thème mobile */}
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground px-3 mb-3">Apparence</h3>
                  <div className="px-3">
                    <ThemeToggle />
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}