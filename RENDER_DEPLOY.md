# 🚀 Déploiement sur Render (Backend + Redis)

Tu utilises un Redis externe (Redis Labs), voici comment le connecter.

## Étape 1 : Construire l'URL de Connexion

Tu as l'adresse (Host:Port) : `redis-17975.c100.us-east-1-4.ec2.cloud.redislabs.com:17975`.

Il te faut maintenant le **Mot de Passe** (Password).

1. Va sur ton dashboard Redis (là où tu as trouvé l'adresse).
2. Cherche "Security" ou "Default User Password" et copie-le.

Ensuite, construis ton URL complète selon ce modèle :
`redis://default:MOT_DE_PASSE@ADRESSE:PORT`

**Exemple :**
Si ton mot de passe est `monSuperMdp123`, ton URL finale sera :
`redis://default:fisHoZ5hDDkvSzpJWgSHgNRbV3y2zEvP@redis-17975.c100.us-east-1-4.ec2.cloud.redislabs.com:17975`

## Étape 2 : Configurer Render

1. Va sur ton dashboard **Render** -> Choisis ton **Web Service** (Backend).
2. Clique sur l'onglet **Environment**.
3. Ajoute une variable :
    * **Key :** `REDIS_URL`
    * **Value :** (Colle l'URL complète que tu as construite à l'étape 1)
4. Clique sur **Save Changes**.

Render va redémarrer ton backend et il se connectera automatiquement ! 🚀
