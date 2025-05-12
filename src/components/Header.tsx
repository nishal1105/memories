
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/context/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Home, User, PlusCircle, LogOut, Menu, X } from 'lucide-react';

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-b">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2" onClick={closeMenu}>
          <span className="memory-text-gradient text-2xl font-bold">Memories</span>
        </Link>

        {/* Mobile menu button */}
        <button 
          className="md:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-sm font-medium flex items-center gap-1.5 hover:text-memory-primary transition-colors">
            <Home size={18} />
            <span>Home</span>
          </Link>
          
          {isAuthenticated ? (
            <>
              <Link to="/create" className="text-sm font-medium flex items-center gap-1.5 hover:text-memory-primary transition-colors">
                <PlusCircle size={18} />
                <span>Create Memory</span>
              </Link>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="p-0 hover:bg-transparent">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.profileImage} alt={user?.username} />
                      <AvatarFallback>{user?.username.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center gap-2 cursor-pointer">
                      <User size={16} />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={logout} className="flex items-center gap-2 cursor-pointer text-red-500 focus:text-red-500">
                    <LogOut size={16} />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="outline">Login</Button>
              </Link>
              <Link to="/register">
                <Button>Sign Up</Button>
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile navigation */}
        {isMenuOpen && (
          <div className="md:hidden fixed inset-0 top-16 bg-white dark:bg-gray-900 p-4 flex flex-col animate-fade-in">
            <div className="flex flex-col gap-6">
              <Link 
                to="/" 
                className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
                onClick={closeMenu}
              >
                <Home size={20} />
                <span className="text-lg">Home</span>
              </Link>
              
              {isAuthenticated ? (
                <>
                  <Link 
                    to="/create" 
                    className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
                    onClick={closeMenu}
                  >
                    <PlusCircle size={20} />
                    <span className="text-lg">Create Memory</span>
                  </Link>
                  
                  <Link 
                    to="/profile" 
                    className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
                    onClick={closeMenu}
                  >
                    <User size={20} />
                    <span className="text-lg">Profile</span>
                  </Link>
                  
                  <button 
                    onClick={() => {
                      logout();
                      closeMenu();
                    }} 
                    className="flex items-center gap-2 p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md mt-4"
                  >
                    <LogOut size={20} />
                    <span className="text-lg">Logout</span>
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-3 mt-4">
                  <Link to="/login" onClick={closeMenu}>
                    <Button variant="outline" className="w-full justify-center">Login</Button>
                  </Link>
                  <Link to="/register" onClick={closeMenu}>
                    <Button className="w-full justify-center">Sign Up</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
