'use client';
import Link from 'next/link';
import { useAuth } from '../hooks/useAuth';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const NavBar = () => {
  const { user, loading, logout, checkAuth } = useAuth();
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <nav className="bg-gray-900 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold hover:text-gray-300">
          SlayerGates
        </Link>
        
        <div className="flex items-center space-x-6">
          <Link href="/tournaments" className="hover:text-red-500 transition-colors">
            Tournois
          </Link>
          <Link href="/teams" className="hover:text-red-500 transition-colors">
            Équipes
          </Link>
          <Link href="/upcoming-matches" className="hover:text-red-500 transition-colors">
            Matchs à venir
          </Link>
          <Link href="/leaderboard" className="hover:text-red-500 transition-colors">
            Classement
          </Link>
          <Link href="/about" className="hover:text-red-500 transition-colors">
            À propos
          </Link>
          
          {loading ? (
            <div className="animate-pulse bg-gray-700 h-10 w-24 rounded-md"></div>
          ) : user ? (
            <div className="flex items-center gap-4">
              <Link 
                href="/profile" 
                className="flex items-center gap-2 hover:text-red-500 transition-colors"
              >
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt="Avatar"
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center">
                    {user.pseudo.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="font-semibold">{user.pseudo}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="text-gray-300 hover:text-red-500 transition-colors"
              >
                Déconnexion
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="text-gray-300 hover:text-red-500 transition-colors"
              >
                Connexion
              </Link>
              <Link
                href="/register"
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors"
              >
                S'inscrire
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;