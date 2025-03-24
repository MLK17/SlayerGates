import MainLayout from '../layouts/MainLayout';

export default function About() {
  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-100 py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">À propos de SlayerGates</h1>
          
          <div className="bg-white rounded-lg shadow-lg p-8 space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Notre Mission</h2>
              <p className="text-gray-600 leading-relaxed">
                SlayerGates est une plateforme dédiée à l'organisation de tournois esport, conçue pour rassembler 
                les passionnés de jeux vidéo compétitifs. Notre mission est de créer un environnement où les joueurs 
                peuvent se mesurer les uns aux autres dans un esprit de compétition sain et amical.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Nos Valeurs</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Compétition</h3>
                  <p className="text-gray-600">
                    Nous encourageons une compétition saine et respectueuse entre les joueurs.
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Communauté</h3>
                  <p className="text-gray-600">
                    Nous créons un espace où les joueurs peuvent se rencontrer et partager leur passion.
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Innovation</h3>
                  <p className="text-gray-600">
                    Nous nous efforçons d'améliorer constamment l'expérience de nos utilisateurs.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Fonctionnalités</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>Organisation de tournois personnalisables</li>
                <li>Gestion d'équipes et de joueurs</li>
                <li>Suivi des matchs en temps réel</li>
                <li>Classements et statistiques détaillés</li>
                <li>Communication entre équipes</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact</h2>
              <p className="text-gray-600 leading-relaxed">
                Pour toute question ou suggestion, n'hésitez pas à nous contacter :
              </p>
              <div className="mt-4 space-y-2 text-gray-600">
                <p>Email: contact@slayergates.com</p>
                <p>Discord: SlayerGates#0001</p>
                <p>Twitter: @SlayerGates</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}