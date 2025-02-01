export default function About() {
  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">À propos</h1>
        <div className="bg-white rounded-lg shadow p-8">
          <h2 className="text-2xl font-bold mb-4">La Porte du Slayer</h2>
          <p className="text-gray-600 mb-6">
            La Porte du Slayer est une plateforme dédiée aux joueurs passionnés de jeux vidéo compétitifs. 
            Notre mission est de créer une communauté dynamique et accueillante où les joueurs peuvent 
            se défier, progresser et partager leur passion du gaming.
          </p>
          <h3 className="text-xl font-bold mb-3">Notre Vision</h3>
          <p className="text-gray-600 mb-6">
            Nous aspirons à devenir la référence des tournois en ligne en France, 
            en proposant une expérience unique et professionnelle à nos joueurs.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="text-center">
              <h4 className="font-bold mb-2">Tournois Organisés</h4>
              <p className="text-red-600 text-2xl font-bold">100+</p>
            </div>
            <div className="text-center">
              <h4 className="font-bold mb-2">Joueurs Actifs</h4>
              <p className="text-red-600 text-2xl font-bold">5000+</p>
            </div>
            <div className="text-center">
              <h4 className="font-bold mb-2">Prix Distribués</h4>
              <p className="text-red-600 text-2xl font-bold">50000€+</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 