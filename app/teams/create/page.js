'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/hooks/useAuth';

export default function CreateTeam() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    school_id: ''
  });
  const [logo, setLogo] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [schools, setSchools] = useState([]);

  useEffect(() => {
    // Rediriger vers la page de connexion si l'utilisateur n'est pas connecté
    if (!authLoading && !user) {
      router.push('/login?redirect=/teams/create');
      return;
    }

    const fetchSchools = async () => {
      try {
        const response = await fetch('/api/schools');
        if (!response.ok) {
          throw new Error('Erreur lors du chargement des écoles');
        }
        const data = await response.json();
        setSchools(data.schools || []);
      } catch (error) {
        console.error('Erreur:', error);
        setError('Impossible de charger la liste des écoles');
      }
    };

    if (user) {
      fetchSchools();
    }
  }, [user, authLoading, router]);

  // Ne pas afficher le formulaire si l'utilisateur n'est pas connecté ou si on est en train de vérifier l'authentification
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl text-gray-600">Chargement...</div>
      </div>
    );
  }

  if (!user) {
    return null; // Ne rien afficher pendant la redirection
  }

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        setError('Le logo ne doit pas dépasser 2MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        setError('Le fichier doit être une image');
        return;
      }
      setLogo(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('school_id', formData.school_id);
      if (logo) {
        formDataToSend.append('logo', logo);
      }

      const response = await fetch('/api/teams', {
        method: 'POST',
        body: formDataToSend
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Une erreur est survenue');
      }

      router.push('/teams');
    } catch (err) {
      setError(err.message || 'Une erreur est survenue lors de la création de l\'équipe');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-8">
        <h1 className="text-3xl font-bold mb-8">Créer une équipe</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Nom de l'équipe
            </label>
            <input
              id="name"
              type="text"
              required
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="school" className="block text-sm font-medium text-gray-700 mb-2">
              École
            </label>
            <select
              id="school"
              required
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              value={formData.school_id}
              onChange={(e) => setFormData({ ...formData, school_id: e.target.value })}
              disabled={loading}
            >
              <option value="">Sélectionnez une école</option>
              {schools.map((school) => (
                <option key={school.id} value={school.id}>
                  {school.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="logo" className="block text-sm font-medium text-gray-700">
              Logo de l'équipe
            </label>
            <input
              type="file"
              id="logo"
              name="logo"
              accept=".jpg,.jpeg,.png,.webp"
              onChange={handleLogoChange}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
            <p className="mt-1 text-sm text-gray-500">
              Formats acceptés : JPG, JPEG, PNG, WEBP. Taille maximale : 2 MB
            </p>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Création...' : 'Créer l\'équipe'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}