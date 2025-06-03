import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Sun, Moon, Search, ChevronDown } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  // Add shadow on scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <header 
      className={`sticky top-0 bg-white dark:bg-navy-900 transition-all duration-200 z-10 ${
        isScrolled ? 'shadow-md' : ''
      }`}
    >
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Main Navigation */}
          <div className="flex items-center">
            <Link 
              to="/" 
              className="flex items-center space-x-2"
              aria-label="Home"
            >
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="#FF6600" />
              </svg>
              <span className="text-xl font-bold tracking-tight hidden sm:block">
                ModernHN
              </span>
            </Link>
            
            <nav className="hidden md:ml-8 md:flex md:space-x-4">
              <Link to="/" className="px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 dark:hover:bg-navy-800 transition-colors">
                Top
              </Link>
              <Link to="/newest" className="px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 dark:hover:bg-navy-800 transition-colors">
                New
              </Link>
              <Link to="/submit" className="px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 dark:hover:bg-navy-800 transition-colors">
                Submit
              </Link>
            </nav>
          </div>
          
          {/* Right side items */}
          <div className="flex items-center space-x-2">
            <button 
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-navy-800 transition-colors"
            >
              {theme === 'dark' ? (
                <Sun size={20} className="text-yellow-400" />
              ) : (
                <Moon size={20} />
              )}
            </button>
            
            <div className="hidden sm:block">
              {isAuthenticated ? (
                <div className="relative group">
                  <button className="flex items-center space-x-1 px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 dark:hover:bg-navy-800 transition-colors">
                    <span>{user?.username}</span>
                    <ChevronDown size={16} />
                  </button>
                  <div className="absolute right-0 mt-1 w-48 rounded-md shadow-lg bg-white dark:bg-navy-800 ring-1 ring-black ring-opacity-5 hidden group-hover:block animate-fade-in">
                    <div className="py-1">
                      <Link to={`/user/${user?.id}`} className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-navy-700">
                        Profile
                      </Link>
                      <button
                        onClick={() => logout()}
                        className="w-full text-left block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-navy-700 text-error-500"
                      >
                        Sign out
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex space-x-1">
                  <Link to="/login" className="px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 dark:hover:bg-navy-800 transition-colors">
                    Login
                  </Link>
                  <Link to="/register" className="px-3 py-2 text-sm font-medium bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors">
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
            
            {/* Mobile menu button */}
            <button
              onClick={toggleMenu}
              className="md:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-navy-800 transition-colors"
              aria-expanded={isMenuOpen}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-4 space-y-1 bg-white dark:bg-navy-900 shadow-lg animate-slide-up">
            <Link to="/" className="block px-3 py-2 text-base font-medium rounded-md hover:bg-gray-100 dark:hover:bg-navy-800">
              Top
            </Link>
            <Link to="/newest" className="block px-3 py-2 text-base font-medium rounded-md hover:bg-gray-100 dark:hover:bg-navy-800">
              New
            </Link>
            <Link to="/submit" className="block px-3 py-2 text-base font-medium rounded-md hover:bg-gray-100 dark:hover:bg-navy-800">
              Submit
            </Link>
            
            <div className="pt-4 border-t border-gray-200 dark:border-navy-700">
              {isAuthenticated ? (
                <>
                  <Link to={`/user/${user?.id}`} className="block px-3 py-2 text-base font-medium rounded-md hover:bg-gray-100 dark:hover:bg-navy-800">
                    Profile ({user?.karma} karma)
                  </Link>
                  <button
                    onClick={() => logout()}
                    className="w-full text-left block px-3 py-2 text-base font-medium rounded-md hover:bg-gray-100 dark:hover:bg-navy-800 text-error-500"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <div className="flex flex-col space-y-2">
                  <Link to="/login" className="block px-3 py-2 text-base font-medium rounded-md hover:bg-gray-100 dark:hover:bg-navy-800">
                    Login
                  </Link>
                  <Link to="/register" className="block px-3 py-2 text-base font-medium bg-primary-500 text-white rounded-md hover:bg-primary-600">
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;