# 🚀 Activer Redis pour DKHOUL

Redis est nécessaire pour la performance (cache). Voici comment l'activer simplement sur ta machine Windows.

## ✅ Option 1 : Via Docker (Recommandé)

Nous avons détecté que **Docker** est installé sur ta machine. C'est la méthode la plus propre.

1. Lance l'application **Docker Desktop** depuis ton menu Démarrer.
2. Une fois lancé (attends que la baleine ne bouge plus), exécute cette commande dans ton terminal :

    ```powershell
    docker run -d --name redis-server -p 6379:6379 redis:alpine
    ```

    *Cette commande télécharge et lance un petit serveur Redis.*

3. C'est tout ! L'application se connectera automatiquement.

---

## 📦 Option 2 : Installation Windows (Si Docker bug)

Si tu ne veux pas utiliser Docker, tu peux installer une version native pour Windows.

1. Va sur [Memurai Developer (Compatible Redis)](https://www.memurai.com/get-memurai).
2. Télécharge et Installe la version Developer (Gratuite).
3. Redis sera lancé automatiquement en arrière-plan.

---

## ℹ️ Vérification

Pour vérifier que ça marche, tape dans ton terminal :

```powershell
Test-NetConnection -ComputerName localhost -Port 6379
```

Si `TcpTestSucceeded : True`, c'est gagné !
