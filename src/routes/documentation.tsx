import { appHref } from '#/lib/app-href'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/documentation')({
  component: Documentation,
})

/**
 * Page de documentation integree pour l'exercice d'inscription.
 */
export function Documentation() {
  return (
    <main className="prose prose-invert max-w-4xl p-8">
      <a href={appHref()} className="not-prose text-sm underline">
        Retour au formulaire
      </a>

      <h1>Documentation du projet</h1>

      <h2>Fonctionnalites</h2>
      <ul>
        <li>
          Formulaire d'inscription avec nom, prenom, email, date de naissance,
          ville et code postal.
        </li>
        <li>
          Bouton de sauvegarde desactive tant que tous les champs ne sont pas
          remplis.
        </li>
        <li>Validation complete avant sauvegarde.</li>
        <li>Sauvegarde des inscriptions valides dans MySQL via FastAPI.</li>
        <li>Liste publique avec informations reduites : prenom, nom, email.</li>
        <li>
          Compte admin permettant de voir les informations privees et de
          supprimer un inscrit.
        </li>
      </ul>

      <h2>Architecture Docker</h2>
      <ul>
        <li>
          <code>db</code> : MySQL avec migrations dans <code>migrations/</code>.
        </li>
        <li>
          <code>adminer</code> : interface d'administration MySQL sur le port
          8081.
        </li>
        <li>
          <code>server</code> : API Python FastAPI sur le port 8000.
        </li>
        <li>
          <code>react</code> : build Vite servi par nginx sur le port 3000.
        </li>
      </ul>

      <h2>Administrateur</h2>
      <p>
        L'administrateur est insere au premier demarrage MySQL depuis les
        variables <code>ADMIN_EMAIL</code> et <code>ADMIN_PASSWORD</code>. Les
        scripts de test utilisent <code>admin@example.test</code> et{' '}
        <code>local-dev-admin-password</code>.
      </p>

      <h2>API</h2>
      <ul>
        <li>
          <code>GET /health</code> verifie l'API et la base.
        </li>
        <li>
          <code>GET /users</code> retourne la liste publique.
        </li>
        <li>
          <code>POST /users</code> cree une inscription.
        </li>
        <li>
          <code>GET /admin/users/:id</code> retourne les donnees privees avec
          Basic Auth admin.
        </li>
        <li>
          <code>DELETE /admin/users/:id</code> supprime un inscrit avec Basic
          Auth admin.
        </li>
      </ul>

      <h2>Tests et qualite</h2>
      <pre>
        <code>
          pnpm run coverage{`\n`}
          python -m pytest server{`\n`}
          pnpm run test:infra{`\n`}
          pnpm run cy:run
        </code>
      </pre>

      <h2>CI/CD</h2>
      <p>
        GitHub Actions construit le front, lance les tests frontend avec
        couverture, lance les tests backend, demarre Docker pour les tests
        d'infrastructure et lance Cypress. Le deploiement final AWS se lance
        manuellement, pousse les images sur le registry prive, cree l'EC2
        applicative avec Terraform, execute Ansible et valide le front et l'API.
      </p>
    </main>
  )
}
