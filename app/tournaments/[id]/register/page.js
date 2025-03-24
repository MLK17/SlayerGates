'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/hooks/useAuth';
import { use } from 'react';

export default function TournamentRegister({ params }) {
  const resolvedParams = use(params);
  const tournamentId = resolvedParams.id;
  const router = useRouter();
  const { user } = useAuth();
  const [tournament, setTournament] = useState(null);
  const [userTeams, setUserTeams] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Charger les données du tournoi
  useEffect(() => {
    const fetchTournamentData = async () => {
      try {
        const response = await fetch(`/api/tournaments/${tournamentId}`);
        if (!response.ok) throw new Error('Tournoi non trouvé');
        const data = await response.json();
        setTournament(data);

        // Vérifier si le tournoi est complet
        if (data.teams && data.teams.length >= data.max_players) {
          setError('Ce tournoi est complet');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTournamentData();
  }, [tournamentId]);

  // Charger les équipes dont l'utilisateur est capitaine
  useEffect(() => {
    const fetchUserTeams = async () => {
      if (!user) return;
      try {
        const response = await fetch('/api/teams/captain');
        if (!response.ok) throw new Error('Erreur lors du chargement des équipes');
        const data = await response.json();
        setUserTeams(data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchUserTeams();
  }, [user]);

  // Charger les membres de l'équipe sélectionnée
  useEffect(() => {
    const fetchTeamMembers = async () => {
      if (!selectedTeamId) {
        setTeamMembers([]);
        setSelectedPlayers([]);
        return;
      }
      
      try {
        console.log('Tentative de récupération des membres pour l\'équipe:', selectedTeamId);
        const response = await fetch(`/api/teams/${selectedTeamId}/members`);
        console.log('Statut de la réponse:', response.status);
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Erreur détaillée:', errorData);
          throw new Error(errorData.error || 'Erreur lors du chargement des membres');
        }
        
        const data = await response.json();
        console.log('Données reçues:', data);
        
        // S'assurer que nous avons bien les données attendues
        if (!data.captain || !Array.isArray(data.members)) {
          throw new Error('Format de données invalide');
        }

        // Créer une liste unique de membres avec le capitaine
        const allMembers = [
          { 
            id: `captain-${data.captain.id}`,
            user: data.captain,
            isCaptain: true 
          },
          ...data.members.map(member => ({
            id: `member-${member.user.id}`,
            user: member.user,
            isCaptain: false
          }))
        ];
        
        console.log('Liste finale des membres:', allMembers);
        setTeamMembers(allMembers);
        // Ne pas sélectionner automatiquement le capitaine
        setSelectedPlayers([]);
      } catch (err) {
        console.error('Erreur complète:', err);
        setError('Erreur lors du chargement des membres de l\'équipe');
        setTeamMembers([]);
        setSelectedPlayers([]);
      }
    };

    fetchTeamMembers();
  }, [selectedTeamId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTeamId || selectedPlayers.length !== tournament.players_per_team) {
      setError('Veuillez sélectionner les joueurs requis');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      // Convertir les IDs en nombres
      const teamIdNumber = parseInt(selectedTeamId, 10);
      const playerIdsNumbers = selectedPlayers.map(id => parseInt(id, 10));

      const requestData = {
        teamId: teamIdNumber,
        playerIds: playerIdsNumbers
      };

      console.log('Données envoyées:', requestData);

      const response = await fetch(`/api/tournaments/${tournamentId}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      console.log('Statut de la réponse:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Erreur reçue:', errorData);
        throw new Error(errorData.error || 'Erreur lors de l\'inscription');
      }

      const data = await response.json();
      console.log('Réponse reçue:', data);

      // Afficher le message de succès
      setSuccess('Votre équipe a été inscrite avec succès au tournoi !');
      
      // Rediriger après un délai
      setTimeout(() => {
        router.push('/tournaments');
      }, 2000);

    } catch (err) {
      console.error('Erreur complète:', err);
      setError(err.message || 'Une erreur est survenue lors de l\'inscription');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePlayerSelection = (playerId) => {
    setSelectedPlayers(prev => {
      if (prev.includes(playerId)) {
        return prev.filter(id => id !== playerId);
      } else {
        return [...prev, playerId];
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-600">Chargement...</p>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-red-600">Tournoi non trouvé</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-6">Inscription au tournoi {tournament.title}</h1>
          
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <p className="text-green-700">{success}</p>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <h2 className="text-lg font-semibold mb-2">Informations importantes</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Nombre de joueurs requis par équipe : <span className="font-bold text-red-600">{tournament.players_per_team}</span></li>
              <li>Places restantes : <span className="font-bold">{tournament.max_players - (tournament.teams?.length || 0)}</span> équipe{tournament.max_players - (tournament.teams?.length || 0) > 1 ? 's' : ''}</li>
            </ul>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="team" className="block text-sm font-medium text-gray-700 mb-2">
                Sélectionnez votre équipe
              </label>
              <select
                id="team"
                value={selectedTeamId}
                onChange={(e) => setSelectedTeamId(e.target.value)}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-red-500 focus:border-red-500"
                required
              >
                <option value="">Choisir une équipe</option>
                {userTeams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedTeamId && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sélectionnez les joueurs participants ({selectedPlayers.length}/{tournament.players_per_team} joueurs)
                </label>
                <div className="space-y-2">
                  {teamMembers.map((member) => (
                    <div key={member.id} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`player-${member.id}`}
                        checked={selectedPlayers.includes(member.user.id)}
                        onChange={() => {
                          if (!selectedPlayers.includes(member.user.id) && selectedPlayers.length >= tournament.players_per_team) {
                            setError(`Vous ne pouvez sélectionner que ${tournament.players_per_team} joueurs`);
                            return;
                          }
                          handlePlayerSelection(member.user.id);
                          setError('');
                        }}
                        className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                        disabled={!selectedPlayers.includes(member.user.id) && selectedPlayers.length >= tournament.players_per_team}
                      />
                      <label
                        htmlFor={`player-${member.id}`}
                        className={`ml-2 block text-sm ${!selectedPlayers.includes(member.user.id) && selectedPlayers.length >= tournament.players_per_team ? 'text-gray-400' : 'text-gray-900'}`}
                      >
                        {member.user.pseudo} {member.isCaptain && '(Capitaine)'}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.push('/tournaments')}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                disabled={!selectedTeamId || selectedPlayers.length !== tournament.players_per_team || isSubmitting}
              >
                {isSubmitting 
                  ? 'Inscription en cours...' 
                  : selectedPlayers.length === tournament.players_per_team
                    ? 'Finaliser l\'inscription'
                    : `Sélectionnez ${tournament.players_per_team - selectedPlayers.length} joueur${tournament.players_per_team - selectedPlayers.length > 1 ? 's' : ''} de plus`
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
