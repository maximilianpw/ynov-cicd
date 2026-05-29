# Ynov CICD

## Lancer le projet

```bash
pnpm install
pnpm run dev
```

L'application tourne ensuite en local sur le port affiché par Vite, généralement `http://localhost:3000`.

## Commandes utiles

```bash
pnpm run test      # lance les tests
pnpm run coverage  # lance les tests avec couverture
pnpm run build     # build de production
pnpm run lint      # vérification ESLint
```

La documentation est aussi accessible depuis l'application via le lien **Documentation** sur la page d'accueil.

## Structure rapide

- `src/lib/validators.ts` : fonctions de validation.
- `src/components/RegistrationForm.tsx` : formulaire d'inscription.
- `src/lib/registrations-storage.ts` : sauvegarde et lecture du local storage.
- `src/routes/documentation.tsx` : documentation intégrée à l'app.

## Énoncé

Dans un framework js, faites un petit projet permettant à un utilisateur de s’enregistrer sur un formulaire avec nom, prénom, mail, date de naissance, ville, code postal et un bouton de sauvegarde.

Le bouton est non clickable tant que les champs précédents ne sont pas remplis.

Si les champs sont valides, on sauvegarde dans le local storage et on affiche un toaster de succès, puis on vide les champs.

Si les champs ne sont pas valides, on affiche un toaster d’erreur, et on écrit un message d’erreur sous chaque champ en erreur, en rouge

Les règles de validation :

La date de naissance bloque les -18 ans,

Le code postal doit être au format français,

Les noms, prénoms doivent être valides (sans caractère spéciaux et chiffres mais accepter les accents, tréma, tiret, etc),

L’email doit être valide

Les fonctions de vérification sont dans un fichier js à part qui sera totalement testé. Les composants également. La couverture attendue est de 100% (index.js et reportWebVitals exclus), exportée dans code coverage avec tous les tests unitaires et d’intégrations passant avec succès. Une documentation complète à fournir. La fiabilité des tests sera prise en compte.

Les tests à avoir au minimum :

Le calcul de l'âge

L'âge > 18 ans

Le format du code postal

Le format des noms et prénoms (avec différents cas particulier)

Le format de l’email

La désactivation du bouton si les champs ne sont pas remplis

La sauvegarde dans le local storage et le toaster de succès, avec champs vidés

Le toaster d’erreur et les erreurs correspondantes en rouge

Projet à mettre sur github, en ajoutant au gitignore les node_modules, le dossier de couverture et le dossier de docs.

Le projet doit être déployé avec github action sur github pages, les tests UT et IT doivent être en succès avant le déploiement sur npm et sur github pages.

Votre historique de package npm et de commit doit justifier d'avoir publié automatiquement une version patch et une minor. Potentiellement une major si vous en aviez besoin

Le rendu attendue est un fichier txt avec :

lien du repository github public

lien du projet déployé sur github pages

lien vers le package npm public

lien vers le rapport de couverture codecov public

Notation individuelle :

Tests UT (qualité, fiabilité, couverture) / 5

Tests IT (qualité, fiabilité, couverture) / 5

Documentation avec readme, accessible depuis l’app lancé, et couverture sur codecov / 5

Workflow github fonctionnel avec testing, déploiement sur npm et sur github pages / 5
