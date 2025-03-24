"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/hooks/useAuth';
import Link from 'next/link';

export default function Tournaments() {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userTeam, setUserTeam] = useState(null);
  const router = useRouter();
  const { user, isCaptain } = useAuth();

  useEffect(() => {
    async function fetchUserTeam() {
      if (!user || !isCaptain) return;
      try {
        const response = await fetch('/api/teams/captain');
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            setUserTeam(data[0]); // Prendre la première équipe (un capitaine ne peut avoir qu'une équipe)
          }
        }
      } catch (error) {
        console.error('Erreur lors de la récupération de l\'équipe:', error);
      }
    }

    async function fetchTournaments() {
      try {
        const response = await fetch('/api/tournaments');
        const data = await response.json();
        
        if (data.error) {
          setError(data.error);
        } else {
          setTournaments(data.tournaments || []);
        }
      } catch (error) {
        setError('Erreur lors de la récupération des tournois');
      } finally {
        setLoading(false);
      }
    }

    fetchTournaments();
    fetchUserTeam();
  }, [user, isCaptain]);

  const handleRegister = (tournamentId) => {
    if (!user) {
      router.push('/login?redirect=/tournaments');
      return;
    }
    if (!isCaptain) {
      return;
    }
    router.push(`/tournaments/${tournamentId}/register`);
  };

  const isTeamRegistered = (tournament) => {
    if (!userTeam) return false;
    return tournament.teams.some(registration => registration.team.id === userTeam.id);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 py-12">
        <div className="container mx-auto px-4">
          <p className="text-center text-gray-600">Chargement des tournois...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 py-12">
        <div className="container mx-auto px-4">
          <p className="text-center text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Tournois</h1>
        {tournaments.length === 0 ? (
          <p className="text-center text-gray-600">Aucun tournoi disponible pour le moment.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tournaments.map((tournament) => (
              <div key={tournament.id} className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-2">{tournament.title}</h2>
                <p className="text-gray-600 mb-2">Jeu: {tournament.game}</p>
                <p className="text-gray-600 mb-2">Format: {tournament.format}</p>
                
                {/* Informations sur les équipes et les joueurs */}
                <div className="bg-gray-50 rounded p-3 mb-4">
                  <p className="text-sm font-semibold mb-1">Informations importantes :</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• {tournament.players_per_team} joueur{tournament.players_per_team > 1 ? 's' : ''} requis par équipe</li>
                    <li>• {tournament.max_players - tournament.teams.length} place{tournament.max_players - tournament.teams.length > 1 ? 's' : ''} restante{tournament.max_players - tournament.teams.length > 1 ? 's' : ''}</li>
                    <li className="text-xs text-gray-500">({tournament.teams.length}/{tournament.max_players} équipe{tournament.max_players > 1 ? 's' : ''} inscrite{tournament.max_players > 1 ? 's' : ''})</li>
                  </ul>
                </div>

                <p className="text-gray-600 mb-2">
                  Date: {new Date(tournament.start_date).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
                
                {/* Statut du tournoi */}
                <div className={`text-sm mb-4 px-2 py-1 rounded-full text-center ${
                  tournament.teams.length >= tournament.max_players
                    ? 'bg-red-100 text-red-800'
                    : tournament.teams.length >= tournament.max_players * 0.8
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-green-100 text-green-800'
                }`}>
                  {tournament.teams.length >= tournament.max_players
                    ? 'Complet'
                    : tournament.teams.length >= tournament.max_players * 0.8
                    ? 'Presque complet'
                    : 'Inscriptions ouvertes'
                  }
                </div>
                
                {/* Bouton d'inscription conditionnel */}
                {isCaptain ? (
                  isTeamRegistered(tournament) ? (
                    <div className="text-center py-2 px-4 bg-green-50 border border-green-200 rounded text-green-700">
                      Votre équipe est déjà inscrite à ce tournoi
                    </div>
                  ) : tournament.teams.length >= tournament.max_players ? (
                    <div className="text-center py-2 px-4 bg-gray-100 rounded text-gray-600">
                      Tournoi complet
                    </div>
                  ) : (
                    <button 
                      onClick={() => handleRegister(tournament.id)}
                      className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors"
                    >
                      Inscrire une équipe ({tournament.players_per_team} joueur{tournament.players_per_team > 1 ? 's' : ''} requis)
                    </button>
                  )
                ) : user ? (
                  <div className="text-center py-2 px-4 bg-gray-50 rounded text-sm text-gray-600">
                    Seuls les capitaines d'équipe peuvent inscrire une équipe
                  </div>
                ) : (
                  <Link 
                    href="/login?redirect=/tournaments"
                    className="block text-center bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200 transition-colors"
                  >
                    Connectez-vous pour inscrire une équipe
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}