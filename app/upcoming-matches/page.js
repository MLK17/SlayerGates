'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import MainLayout from '../layouts/MainLayout';

export default function UpcomingMatches() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const response = await fetch('/api/matches/upcoming');
        if (!response.ok) {
          throw new Error('Failed to fetch matches');
        }
        const data = await response.json();
        setMatches(data.matches || []); 
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="text-xl text-gray-600">Chargement des matchs...</div>
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
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Matchs à venir</h1>
          
          {matches.length === 0 ? (
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <h2 className="text-xl text-gray-700 mb-4">Aucun match à venir</h2>
              <Link 
                href="/tournaments" 
                className="inline-block bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Voir les tournois
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {matches.map((match) => (
                <div 
                  key={match.id} 
                  className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                >
                  <div className="bg-red-600 text-white p-4">
                    <h3 className="font-semibold text-lg mb-1">{match.tournament.title}</h3>
                    <p className="text-sm opacity-90">Round {match.round}</p>
                  </div>
                  
                  <div className="p-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          <p className="font-medium">{match.team1.name}</p>
                          <p className="text-sm text-gray-500">{match.team1.school.name}</p>
                        </div>
                        <div className="text-xl font-bold mx-4">VS</div>
                        <div className="flex-1 text-right">
                          <p className="font-medium">{match.team2.name}</p>
                          <p className="text-sm text-gray-500">{match.team2.school.name}</p>
                        </div>
                      </div>
                      
                      <div className="text-center text-sm text-gray-500">
                        {format(new Date(match.scheduled_time), "d MMMM yyyy 'à' HH'h'mm", { locale: fr })}
                      </div>
                      
                      <div className="text-center">
                        <Link
                          href={`/matches/${match.id}`}
                          className="inline-block bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                        >
                          Voir les détails
                        </Link>
                      </div>
                    </div>
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
