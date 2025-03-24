import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo et Description */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white">SlayerGates</h3>
            <p className="text-sm">
              Votre plateforme de tournois esport dédiée à la compétition et à la passion du gaming.
            </p>
          </div>

          {/* Liens Rapides */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Liens Rapides</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/tournaments" className="hover:text-white transition-colors">
                  Tournois
                </Link>
              </li>
              <li>
                <Link href="/teams" className="hover:text-white transition-colors">
                  Équipes
                </Link>
              </li>
              <li>
                <Link href="/upcoming-matches" className="hover:text-white transition-colors">
                  Matchs à venir
                </Link>
              </li>
              <li>
                <Link href="/leaderboard" className="hover:text-white transition-colors">
                  Classement
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li>Email: contact@slayergates.com</li>
              <li>Discord: SlayerGates#0001</li>
              <li>Twitter: @SlayerGates</li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-sm">
          <p>&copy; {currentYear} SlayerGates. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}
