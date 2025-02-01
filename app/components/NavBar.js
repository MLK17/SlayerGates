'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';

const NavBar = () => {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const response = await fetch('/api/auth/check-admin');
        const data = await response.json();
        setIsAdmin(data.isAdmin);
      } catch (error) {
        console.error('Erreur lors de la vérification du statut admin:', error);
      }
    };

    checkAdminStatus();
  }, []);

  return (
    <nav className="bg-gray-900 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold hover:text-gray-300">
          La Porte du Slayer
        </Link>
        <div className="flex items-center space-x-6">
          <Link href="/tournaments" className="hover:text-red-500 transition-colors">
            Tournois
          </Link>
          <Link href="/teams" className="hover:text-red-500 transition-colors">
            Équipes
          </Link>
          <Link href="/leaderboard" className="hover:text-red-500 transition-colors">
            Classement
          </Link>
          <Link href="/news" className="hover:text-red-500 transition-colors">
            Actualités
          </Link>
          <Link href="/about" className="hover:text-red-500 transition-colors">
            À propos
          </Link>
          <div className="flex gap-4 ml-6">
            <Link
              href="/login"
              className="bg-transparent border-2 border-red-600 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors"
            >
              Connexion
            </Link>
            <Link
              href="/pageregister"
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors"
            >
              S'inscrire
            </Link>
          </div>
          {isAdmin && (
            <Link href="/admin" className="text-red-500 hover:text-red-400">
              Admin
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavBar; 