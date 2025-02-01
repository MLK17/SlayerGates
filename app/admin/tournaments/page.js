'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminTournaments() {
  const [tournaments, setTournaments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    try {
      const response = await fetch('/api/tournaments');
      const data = await response.json();
      setTournaments(data);
    } catch (error) {
      console.error('Erreur lors du chargement des tournois:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTournament = async (id) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce tournoi ?')) {
      try {
        const response = await fetch(`/api/tournaments/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          fetchTournaments();
        }
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestion des Tournois</h1>
        <Link
          href="/admin/tournaments/create"
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Créer un tournoi
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Titre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jeu</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tournaments.map((tournament) => (
                <tr key={tournament.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{tournament.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{tournament.game}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(tournament.start_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{tournament.status}</td>
                  <td className="px-6 py-4 whitespace-nowrap space-x-2">
                    <Link
                      href={`/admin/tournaments/${tournament.id}/edit`}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Modifier
                    </Link>
                    <button
                      onClick={() => deleteTournament(tournament.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 