export default function Tournaments() {
  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Tournois</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Placeholder pour les tournois */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-2">Tournoi Fortnite</h2>
            <p className="text-gray-600 mb-4">Date: 25 Juin 2024</p>
            <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors">
              S'inscrire
            </button>
          </div>
          {/* Ajoutez plus de tournois ici */}
        </div>
      </div>
    </div>
  );
} 