import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/documentation')({
  component: Documentation,
})

/**
 * Page de documentation intégrée pour l'exercice d'inscription.
 */
export function Documentation() {
  return (
    <main className="prose prose-invert max-w-4xl p-8">
      <a href="/" className="not-prose text-sm underline">
        ← Retour au formulaire
      </a>

      <h1>Documentation du projet</h1>

      <h2>Fonctionnalités</h2>
      <ul>
        <li>
          Formulaire d’inscription avec nom, prénom, email, date de
          naissance, ville et code postal.
        </li>
        <li>
          Bouton de sauvegarde désactivé tant que tous les champs ne sont pas
          remplis.
        </li>
        <li>Validation complète avant sauvegarde.</li>
        <li>Sauvegarde des inscriptions valides dans le localStorage.</li>
        <li>
          Toaster de succès après sauvegarde et toaster d’erreur si le
          formulaire est invalide.
        </li>
        <li>Messages d’erreur rouges sous chaque champ invalide.</li>
      </ul>

      <h2>Règles de validation</h2>
      <ul>
        <li>Date de naissance : l’utilisateur doit avoir au moins 18 ans.</li>
        <li>Code postal : exactement 5 chiffres au format français.</li>
        <li>
          Nom, prénom et ville : lettres, accents, espaces, apostrophes et
          tirets autorisés.
        </li>
        <li>Email : format email standard requis.</li>
      </ul>

      <h2>Architecture</h2>
      <ul>
        <li>
          <code>src/lib/validators.ts</code> contient les fonctions pures de
          validation.
        </li>
        <li>
          <code>src/lib/registrations-storage.ts</code> gère la lecture et
          l’écriture localStorage.
        </li>
        <li>
          <code>src/components/RegistrationForm.tsx</code> contient l’état du
          formulaire et la soumission.
        </li>
        <li>
          <code>src/components/RegisteredList.tsx</code> affiche les
          inscriptions sauvegardées.
        </li>
      </ul>

      <h2>Tests et qualité</h2>
      <p>
        Les tests unitaires et d’intégration sont exécutés avec Vitest et React
        Testing Library. La couverture est configurée à 100% sur les fichiers
        applicatifs importants.
      </p>
      <pre>
        <code>pnpm run test{`\n`}pnpm run coverage{`\n`}pnpm run build</code>
      </pre>

      <h2>CI/CD</h2>
      <p>
        Le workflow GitHub Actions construit le projet, exécute les tests avec
        couverture, publie le rapport Codecov, génère la documentation, déploie
        GitHub Pages et publie le package npm après succès des tests.
      </p>
    </main>
  )
}
