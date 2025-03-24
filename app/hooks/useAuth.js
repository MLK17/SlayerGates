'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCaptain, setIsCaptain] = useState(false);
  const router = useRouter();

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/check');
      const data = await response.json();
      
      if (data.user) {
        setUser(data.user);
        // Vérifier si l'utilisateur est capitaine
        const captainResponse = await fetch('/api/teams/captain');
        const captainData = await captainResponse.json();
        setIsCaptain(Array.isArray(captainData) && captainData.length > 0);
      } else {
        setUser(null);
        setIsCaptain(false);
      }
    } catch (error) {
      console.error('Erreur de vérification de l\'authentification:', error);
      setUser(null);
      setIsCaptain(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const refreshAndRedirect = async (path = '/') => {
    await checkAuth(); // Recharger les informations utilisateur
    window.location.href = path; // Utiliser une redirection native pour forcer le rafraîchissement
  };

  const login = async (email, password, redirectPath = '/') => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        await refreshAndRedirect(redirectPath);
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      return { success: false, error: 'Une erreur est survenue lors de la connexion' };
    }
  };

  const register = async (userData, redirectPath = '/') => {
    try {
      console.log('Tentative d\'inscription avec:', { ...userData, password: '***' });
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      console.log('Réponse de l\'inscription:', data);

      if (response.ok) {
        await refreshAndRedirect(redirectPath);
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      return { success: false, error: 'Une erreur est survenue lors de l\'inscription' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      setIsCaptain(false);
      router.refresh();
      router.push('/');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  return { user, loading, isCaptain, login, register, logout, checkAuth };
}
