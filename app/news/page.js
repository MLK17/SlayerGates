export default function News() {
  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Actualités</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Article exemple */}
          <article className="bg-white rounded-lg shadow overflow-hidden">
            <img 
              src="/news/placeholder.jpg" 
              alt="News" 
              className="w-full h-48 object-cover"
            />
            <div className="p-6">
              <h2 className="text-xl font-bold mb-2">Nouveau Tournoi Fortnite</h2>
              <p className="text-gray-600 mb-4">
                Participez à notre prochain tournoi Fortnite avec des prix exceptionnels...
              </p>
              <span className="text-sm text-gray-500">15 Mai 2024</span>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
} 