import { cookies } from 'next/headers';
import { verifyAuth } from '@/lib/auth';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = await cookieStore.get('token');

    if (!token) {
      console.log('Aucun token trouvé');
      return Response.json({ user: null });
    }

    const user = await verifyAuth(token.value);
    
    if (!user) {
      console.log('Token invalide ou expiré');
      // Supprimer le cookie si le token est invalide
      await cookieStore.delete('token');
      return Response.json({ user: null });
    }

    console.log('Utilisateur authentifié:', user.pseudo);
    
    // On ne renvoie que les informations nécessaires
    return Response.json({
      user: {
        id: user.id,
        pseudo: user.pseudo,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Erreur lors de la vérification de l\'authentification:', error);
    return Response.json({ user: null });
  }
}
