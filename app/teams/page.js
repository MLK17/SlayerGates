'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Teams() {
  const [teams, setTeams] = useState([]);
  const [schools, setSchools] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTeams();
    fetchSchools();
  }, []);

  const fetchTeams = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/teams');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors du chargement des équipes');
      }
      
      setTeams(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erreur lors du chargement des équipes:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSchools = async () => {
    try {
      const response = await fetch('/api/schools');
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des écoles');
      }
      const data = await response.json();
      setSchools(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erreur lors du chargement des écoles:', error);
      setError(error.message);
    }
  };

  const filteredTeams = teams && Array.isArray(teams) ? 
    (selectedSchool === 'all' 
      ? teams 
      : teams.filter(team => team.school_id === parseInt(selectedSchool))
    ) 
    : [];

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 py-12">
        <div className="container mx-auto px-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Équipes</h1>
          <Link
            href="/teams/create"
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Créer une équipe
          </Link>
        </div>

        <div className="mb-8">
          <select
            className="w-full md:w-64 p-2 border rounded-lg"
            value={selectedSchool}
            onChange={(e) => setSelectedSchool(e.target.value)}
          >
            <option value="all">Toutes les écoles</option>
            {schools.map((school) => (
              <option key={school.id} value={school.id}>
                {school.name}
              </option>
            ))}
          </select>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTeams.length === 0 ? (
              <div className="col-span-full text-center py-12 text-gray-500">
                Aucune équipe trouvée
              </div>
            ) : (
              filteredTeams.map((team) => (
                <Link href={`/teams/${team.id}`} key={team.id}>
                  <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                    <div className="relative h-48">
                      {team.logo ? (
                        <Image
                          src={team.logo}
                          alt={team.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-400 text-xl">Logo non disponible</span>
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <h2 className="text-xl font-bold mb-2">{team.name}</h2>
                      <p className="text-gray-600 mb-4">{team.school?.name}</p>
                      <div className="flex items-center text-sm text-gray-500">
                        <span>{team.members?.length || 0} membres</span>
                        <span className="mx-2">•</span>
                        <span>{team.tournaments?.length || 0} tournois</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
} 