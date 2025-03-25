# SlayerGates - Plateforme de Tournois Esports

SlayerGates est une plateforme web moderne dédiée à l'organisation et la gestion de tournois esports, inspirée du mode de jeu "Slayer Gates" de DOOM Eternal. Cette application permet aux utilisateurs de créer et gérer des équipes, participer à des tournois, et suivre leur progression via un système de classement dynamique.

## Fonctionnalités Principales

- 🎮 Gestion complète des tournois esports
- 🔐 Système d'authentification sécurisé
- 👥 Gestion des équipes et des joueurs
- 📊 Classements et statistiques en temps réel
- 🏆 Suivi des matchs et résultats
- 💫 Interface utilisateur moderne et responsive

## Stack Technique

- **Frontend**: Next.js, Tailwind CSS
- **Backend**: Next.js API Routes
- **Base de données**: Prisma ORM
- **Authentification**: JWT, bcrypt
- **Styling**: Tailwind CSS

## Prérequis

- Node.js 18+ 
- npm ou yarn
- Une base de données PostgreSQL

## Installation

1. Clonez le repository
```bash
git clone https://github.com/votre-username/slayergates.git
cd slayergates
```

2. Installez les dépendances
```bash
npm install
# ou
yarn install
```

3. Configurez les variables d'environnement
```bash
cp .env.example .env
```
Remplissez les variables dans le fichier .env

4. Initialisez la base de données
```bash
npx prisma migrate dev
```

5. Lancez le serveur de développement
```bash
npm run dev
# ou
yarn dev
```

L'application sera accessible à l'adresse [http://localhost:3000](http://localhost:3000).

## Structure du Projet

```
slayergates/
├── app/               # Routes et composants Next.js
├── components/        # Composants réutilisables
├── prisma/           # Schéma et migrations de base de données
├── public/           # Assets statiques
└── styles/           # Styles globaux
```

## Déploiement

Le moyen le plus simple de déployer l'application est d'utiliser la [Plateforme Vercel](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

Pour plus de détails sur le déploiement, consultez la [documentation de déploiement Next.js](https://nextjs.org/docs/app/building-your-application/deploying).

## Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou soumettre une pull request.

## License

[MIT](https://choosealicense.com/licenses/mit/)
