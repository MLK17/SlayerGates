'use client';
import MainLayout from './layouts/MainLayout';
import Link from 'next/link';
import Carousel from './components/Carousel';
import { useAuth } from './hooks/useAuth';

export default function Home() {
  const { user, loading } = useAuth();

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-100">
        <Carousel />
        <main className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Bienvenue sur La Porte du Slayer
            </h1>
            {!user && !loading && (
              <>
                <p className="text-xl text-gray-600 mb-8">
                  Rejoignez la communauté des gamers et participez à des tournois passionnants
                </p>
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <Link
                      href="/register"
                      className="inline-block bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                    >
                      Créer un compte
                    </Link>
                    <Link
                      href="/login"
                      className="inline-block bg-white text-red-600 border border-red-600 px-8 py-3 rounded-lg font-semibold hover:bg-red-50 transition-colors"
                    >
                      Se connecter
                    </Link>
                  </div>
                </div>
              </>
            )}
            {user && (
              <>
                <p className="text-xl text-gray-600 mb-8">
                  Bienvenue {user.pseudo} ! Découvrez nos derniers tournois et événements.
                </p>
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <Link
                      href="/tournaments"
                      className="inline-block bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                    >
                      Voir les tournois
                    </Link>
                    <Link
                      href="/teams"
                      className="inline-block bg-white text-red-600 border border-red-600 px-8 py-3 rounded-lg font-semibold hover:bg-red-50 transition-colors"
                    >
                      Gérer mon équipe
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </MainLayout>
  );
}
