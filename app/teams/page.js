'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import MainLayout from '../layouts/MainLayout';
import { useAuth } from '@/app/hooks/useAuth';

export default function Teams() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userTeam, setUserTeam] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await fetch('/api/teams');
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Erreur lors de la récupération des équipes');
        }
        const data = await response.json();
        setTeams(data.teams || []);

        // Trouver l'équipe de l'utilisateur connecté
        if (user) {
          const userTeam = data.teams.find(team => 
            team.captain?.id === user.id || 
            team.members.some(member => member.user?.id === user.id)
          );
          setUserTeam(userTeam);
        }
      } catch (err) {
        console.error('Erreur:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, [user]);

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="text-xl text-gray-600">Chargement des équipes...</div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="text-xl text-red-600">Erreur: {error}</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-100 py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900">Équipes</h1>
            {user && !userTeam ? (
              <Link
                href="/teams/create"
                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Créer une équipe
              </Link>
            ) : userTeam ? (
              <div className="text-sm text-gray-600 bg-gray-100 px-4 py-2 rounded">
                Vous appartenez déjà à l'équipe "{userTeam.name}"
              </div>
            ) : (
              <Link
                href="/login?redirect=/teams"
                className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Connectez-vous pour créer une équipe
              </Link>
            )}
          </div>

          {teams.length === 0 ? (
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <h2 className="text-xl text-gray-700 mb-4">Aucune équipe trouvée</h2>
              <p className="text-gray-600">Créez votre première équipe pour commencer !</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {teams.map((team) => (
                <div 
                  key={team.id}
                  className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex items-center mb-4">
                      {team.logo ? (
                        <div className="w-16 h-16 rounded-full overflow-hidden mr-4 flex-shrink-0">
                          <img
                            src={`data:image/jpeg;base64,${team.logo}`}
                            alt={`Logo ${team.name}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gray-200 mr-4 flex-shrink-0 flex items-center justify-center">
                          <span className="text-gray-500 text-2xl">{team.name.charAt(0)}</span>
                        </div>
                      )}
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">{team.name}</h3>
                        <p className="text-gray-600">{team.school?.name || 'Non spécifiée'}</p>
                      </div>
                    </div>
                    <div className="flex items-center text-sm text-gray-500 mb-4">
                      <span>{team.members?.length || 0} membres</span>
                      <span className="mx-2">•</span>
                      <span>{team.tournaments?.length || 0} tournois</span>
                    </div>
                    <Link 
                      href={`/teams/${team.id}`}
                      className="inline-block w-full bg-red-600 text-white text-center px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Voir l'équipe
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}