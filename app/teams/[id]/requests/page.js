'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/app/hooks/useAuth';
import Image from 'next/image';

export default function TeamRequests() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Récupérer les informations de l'équipe
        const teamResponse = await fetch(`/api/teams/${id}`);
        if (!teamResponse.ok) {
          throw new Error('Équipe non trouvée');
        }
        const teamData = await teamResponse.json();
        setTeam(teamData);

        // Vérifier si l'utilisateur est le capitaine
        if (!teamData.userInfo?.isCaptain) {
          router.push(`/teams/${id}`);
          throw new Error('Accès non autorisé');
        }

        // Les demandes sont maintenant incluses dans la réponse de l'équipe
        setRequests(teamData.join_requests || []);
      } catch (err) {
        setError(err.message);
        if (err.message === 'Accès non autorisé') {
          router.push(`/teams/${id}`);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
  }, [id, user, router]);

  const handleRequest = async (requestId, action) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/teams/${id}/requests/${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Une erreur est survenue');
      }

      // Recharger les données de l'équipe pour avoir la liste mise à jour
      const teamResponse = await fetch(`/api/teams/${id}`);
      if (!teamResponse.ok) {
        throw new Error('Erreur lors de la mise à jour des données');
      }
      const teamData = await teamResponse.json();
      setTeam(teamData);
      setRequests(teamData.join_requests || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto">
          <p className="text-center">Chargement...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto">
          <p className="text-red-600 text-center">{error}</p>
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto">
          <p className="text-center">Équipe non trouvée</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">
              Demandes d'adhésion - {team.name}
            </h1>
            <button
              onClick={() => router.push(`/teams/${id}`)}
              className="text-gray-600 hover:text-gray-800 transition-colors"
            >
              Retour à l'équipe
            </button>
          </div>

          {requests.length === 0 ? (
            <p className="text-gray-600 text-center py-4">
              Aucune demande d'adhésion en attente
            </p>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="border rounded-lg p-4 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    {request.user.avatar && (
                      <Image
                        src={request.user.avatar}
                        alt={request.user.pseudo}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                    )}
                    <div>
                      <p className="font-semibold">{request.user.pseudo}</p>
                      <p className="text-sm text-gray-500">
                        Demande envoyée le {new Date(request.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleRequest(request.id, 'APPROVED')}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors disabled:opacity-50"
                      disabled={loading}
                    >
                      {loading ? '...' : 'Accepter'}
                    </button>
                    <button
                      onClick={() => handleRequest(request.id, 'REJECTED')}
                      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors disabled:opacity-50"
                      disabled={loading}
                    >
                      {loading ? '...' : 'Refuser'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
