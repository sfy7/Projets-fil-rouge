# 🚀 Déployer le Portfolio sur Kubernetes avec Terraform

## Pourquoi utiliser Terraform pour Kubernetes ?

| Sans Terraform (kubectl) | Avec Terraform |
|---|---|
| 6 commandes `kubectl apply` | 1 commande `terraform apply` |
| Ordre manuel à respecter | `depends_on` gère l'ordre automatiquement |
| Difficile à versionner | Code `.tf` versionné sur Git |
| Pas de plan avant d'appliquer | `terraform plan` montre tout avant |
| Variables codées en dur dans les YAML | Variables propres dans `variables.tf` |

---

## Architecture des modules

```
02-k8s-deploy/
│
├── main.tf          ← Point d'entrée : appelle les 4 modules
├── variables.tf     ← Toutes les variables
├── outputs.tf       ← Affichage après apply
├── terraform.tfvars ← Tes valeurs (à créer depuis .example)
│
└── modules/
    ├── namespace/   ← Crée le namespace "portfolio"
    │   └── main.tf
    ├── configmap/   ← ConfigMap + Secret (variables d'environnement)
    │   └── main.tf
    ├── deployments/ ← MongoDB StatefulSet + Backend + Frontend
    │   └── main.tf
    └── services/    ← 4 Services (ClusterIP, Headless, NodePort)
        └── main.tf
```

## Ce que Terraform crée (équivalences avec tes fichiers YAML)

| Module Terraform | Fichier YAML équivalent | Ressources créées |
|---|---|---|
| `module.namespace` | `K8s/Base/namespace.yaml` | Namespace `portfolio` |
| `module.configmap` | `K8s/Base/configmap-and-secret.yaml` | ConfigMap + Secret |
| `module.deployments` | `K8s/mongodb.yaml` + `backend.yaml` + `frontend.yaml` | StatefulSet MongoDB + 2 Deployments |
| `module.services` | `K8s/services.yaml` | 4 Services |

---

## Prérequis

```bash
# 1. Minikube installé et démarré
minikube start

# 2. Vérifier que kubectl fonctionne
kubectl get nodes

# 3. Terraform installé
terraform -version
```

## Utilisation

```bash
# 1. Va dans ce dossier
cd 02-k8s-deploy

# 2. Crée ton fichier de variables
cp terraform.tfvars.example terraform.tfvars
# Modifie terraform.tfvars avec ton docker_hub_user

# 3. Initialise (télécharge le provider Kubernetes)
terraform init

# 4. Prévisualise — très utile pour vérifier avant de déployer
terraform plan

# 5. Déploie !
terraform apply
# Tape "yes" → Terraform crée tout dans le bon ordre

# 6. Vérifie
kubectl get all -n portfolio

# 7. Accède au frontend
minikube service frontend-service -n portfolio --url
```

## Déployer une nouvelle version (mise à jour du tag d'image)

```bash
# Option 1 : modifier terraform.tfvars
# image_tag = "42"   ← numéro de build Jenkins

# Option 2 : passer en ligne de commande
terraform apply -var="image_tag=42"

# Terraform détecte le changement et met à jour uniquement les deployments
```

## Intégration dans Jenkins

Ajouter ce stage dans ton `Jenkinsfile` pour remplacer les `kubectl set image` :

```groovy
stage('Terraform Deploy') {
    steps {
        dir('DevOps/terraform-integration/02-k8s-deploy') {
            sh 'terraform init'
            sh "terraform apply -auto-approve -var='image_tag=${BUILD_NUMBER}'"
        }
    }
}
```

## Ordre de création géré par `depends_on`

```
namespace
   ↓
configmap (depends_on: namespace)
   ↓
deployments (depends_on: configmap)
   ↓
services (depends_on: deployments)
```

Terraform garantit cet ordre automatiquement grâce aux `depends_on`.

## Nettoyer (tout supprimer)

```bash
terraform destroy
# Tape "yes"
# Terraform supprime toutes les ressources K8s dans le bon ordre
```
