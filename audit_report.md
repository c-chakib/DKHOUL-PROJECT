# i18n Deep Audit Report

## 1. Static HTML Analysis (Hardcoded Text)

The following components contain hardcoded text, placeholders, or alt attributes:

- **Auth**:
  - `register.component.html`: Placeholders ("Nom complet", "Email", "Mot de passe").
  - `reset-password.component.html`: Placeholders ("Nouveau mot de passe").
  - `forgot-password.component.html`: Placeholders.
  - `login.component.html`: Alt text on logo/images.
- **Service Creation**:
  - `create-service.component.html`:
    - Titles ("Créer une nouvelle expérience", "Informations de base", "Logistique", "Description", "Galerie Photos").
    - Labels ("Titre", "Catégorie", "Ville", "Prix", "Durée", "Participants max").
    - Placeholders ("Ex: Cérémonie...", "Décrivez votre expérience...").
    - Button Text ("Générer avec IA", "Publier l'expérience").
    - Help Text ("Astuce...", "JPG, PNG...").
- **Dashboard**:
  - `super-admin.component.html`: Hardcoded alt text and potential table headers.
  - `dashboard.component.html`: Some static labels in Host view.
- **Other**:
  - `help-center.component.html`: Content text.
  - `contact.component.html`: Form labels and placeholders.
  - `navbar.component.html`: Alt text "Logo".
  - `welcome-door.component.html`: Alt text "Logo".

## 2. TypeScript Strings (Hardcoded Feedback)

The following files use hardcoded strings in `toast` notifications or error handling:

- `create-service.component.ts`: "Maximum 4 images", "Veuillez entrer...", "Erreur AI", "Annonce publiée...".
- `edit-service.component.ts`: Similar update/error messages.
- `service-detail.component.ts`: "Veuillez sélectionner une date", "Please login".
- `auth/`: Login/Register success and error messages ("Compte créé", "Email valide requis").
- `profile-settings.component.ts`: "Profil mis à jour".
- `error.interceptor.ts`: Generic error messages.

## 3. Database & Backend

- **Schema**: `Service.js` updated to support `{ fr, en, ar }` for `title` and `description`. (COMPLETED)
- **Controller**: `serviceController.js` updated to use Gemini for auto-translation. (COMPLETED)
- **Gap**: Frontend `create-service` does NOT currently send the user's interface language (`lang`) to the backend, meaning Gemini defaults to 'fr' translation source effectively.
  - **Fix**: Update `submitService` to include `lang: currentLang`.

## 4. Remediation Plan (Phase 2)

1. **Expand JSON Dictionaries**: Add comprehensive keys for `CREATE_SERVICE`, `AUTH_ERRORS`, `TOASTS`.
2. **Refactor `create-service`**:
    - Use `translate` pipe in HTML.
    - Inject `TranslateService` in TS.
    - Send `lang` payload.
3. **Refactor Auth Components**: Fix placeholders and Toasts.
4. **Refactor Shared Components**: Fix Alt text in Navbar/Footer/Welcome.
