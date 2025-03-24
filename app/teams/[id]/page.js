'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/app/hooks/useAuth';
import Image from 'next/image';
import Link from 'next/link';

export default function TeamPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [userTeamStatus, setUserTeamStatus] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Récupérer les informations de l'équipe
        const response = await fetch(`/api/teams/${id}`);
        if (!response.ok) {
          throw new Error('Équipe non trouvée');
        }
        const data = await response.json();
        setTeam(data);

        // Vérifier si l'utilisateur est déjà dans une équipe
        if (user?.id) {
          const statusResponse = await fetch(`/api/teams/${id}/join/status`);
          if (statusResponse.ok) {
            const statusData = await statusResponse.json();
            setUserTeamStatus(statusData);
            console.log('Status data:', statusData); // Pour déboguer
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, user?.id]);

  const handleJoinRequest = async () => {
    if (!user?.id) {
      setError('Vous devez être connecté pour rejoindre une équipe');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/teams/${id}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur lors de la demande');
      }

      // Recharger la page pour mettre à jour les informations
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Le logo ne doit pas dépasser 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('Le fichier doit être une image');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('logo', file);

      const response = await fetch(`/api/teams/${team.id}`, {
        method: 'PATCH',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour du logo');
      }

      const data = await response.json();
      setTeam(data.team);
      setError(null);
    } catch (err) {
      setError(err.message);
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

  const isCaptain = team.userInfo?.isCaptain;
  const isTeamMember = team.userInfo?.isMember;
  const hasPendingRequest = team.userInfo?.hasPendingRequest;
  const pendingRequestsCount = team.join_requests?.length || 0;
  const canJoinTeam = userTeamStatus?.canRequest && !userTeamStatus?.isInOtherTeam && !userTeamStatus?.isCaptainOfOtherTeam;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="relative h-64 bg-gray-200">
          {team.logo ? (
            <div className="w-full h-full flex items-center justify-center relative group">
              <img
                src={`data:image/jpeg;base64,${team.logo}`}
                alt={`Logo ${team.name}`}
                className="w-full h-full object-cover"
              />
              {isCaptain && (
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <input
                    type="file"
                    id="logo"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="logo"
                    className="cursor-pointer text-white p-2 rounded-full hover:text-red-400 transition-colors"
                    title="Modifier le logo"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                    </svg>
                  </label>
                </div>
              )}
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center relative group">
              <span className="text-gray-400 text-xl">Logo non disponible</span>
              {isCaptain && (
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <input
                    type="file"
                    id="logo"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="logo"
                    className="cursor-pointer text-white p-2 rounded-full hover:text-red-400 transition-colors"
                    title="Ajouter un logo"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                    </svg>
                  </label>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
            <h1 className="text-3xl font-bold text-gray-900">{team.name}</h1>
            {isCaptain && (
              <Link
                href={`/teams/${id}/requests`}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Gérer les demandes {pendingRequestsCount > 0 && `(${pendingRequestsCount})`}
              </Link>
            )}
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">École</h2>
            <p className="text-gray-600">{team.school?.name}</p>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Capitaine</h2>
            <div className="flex items-center space-x-2">
              {team.captain?.avatar && (
                <Image
                  src={team.captain.avatar}
                  alt={team.captain.pseudo}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              )}
              <span className="text-gray-700">{team.captain?.pseudo}</span>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Membres de l'équipe</h2>
            {team.members?.map((member) => (
              <div key={member.id} className="flex items-center mb-2">
                <span className="bg-red-50 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                  {member.user?.pseudo}
                </span>
              </div>
            ))}
          </div>

          {user?.id ? (
            <div className="mt-6">
              {userTeamStatus?.isCaptain ? (
                <p className="text-green-600 text-center">
                  Vous êtes le capitaine de cette équipe
                </p>
              ) : userTeamStatus?.isMember ? (
                <p className="text-green-600 text-center">
                  Vous êtes membre de cette équipe
                </p>
              ) : userTeamStatus?.status === 'PENDING' ? (
                <p className="text-yellow-600 text-center">
                  {userTeamStatus.message}
                </p>
              ) : userTeamStatus?.isNewUser ? (
                <button
                  onClick={handleJoinRequest}
                  className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
                  disabled={loading}
                >
                  {loading ? 'Envoi en cours...' : 'Rejoindre l\'équipe'}
                </button>
              ) : null}
            </div>
          ) : (
            <p className="text-gray-600 text-center mt-6">
              Connectez-vous pour rejoindre cette équipe
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
