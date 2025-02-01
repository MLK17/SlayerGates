import Link from 'next/link';
import Carousel from './components/Carousel';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Carousel />
      <main className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Bienvenue sur La Porte du Slayer
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Rejoignez la communauté des gamers et participez à des tournois passionnants
          </p>
          <div className="space-y-4">
            <Link
              href="/pageregister"
              className="inline-block bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
            >
              Créer un compte
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
