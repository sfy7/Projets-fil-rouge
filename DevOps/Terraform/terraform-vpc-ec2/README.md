# 🏗️ — Création un VPC + EC2 sur AWS

## Ce que ce code déploie

```
Internet
   │
[Internet Gateway]      ← porte d'entrée internet → VPC
   │
[VPC — 10.0.0.0/16]    ← ton réseau privé sur AWS
   │
[Subnet Public]         ← sous-réseau accessible depuis internet
   │
[EC2 t3.micro]          ← ton serveur Linux (avec Docker installé)
   │
[Security Group]        ← pare-feu : autorise HTTP:80 uniquement
```

## Prérequis

```bash
# 1. Installer Terraform (Ubuntu)
sudo apt-get update && sudo apt-get install -y gnupg software-properties-common wget
wget -O- https://apt.releases.hashicorp.com/gpg | \
  sudo gpg --dearmor -o /usr/share/keyrings/hashicorp-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] \
  https://apt.releases.hashicorp.com $(lsb_release -cs) main" | \
  sudo tee /etc/apt/sources.list.d/hashicorp.list
sudo apt-get update && sudo apt-get install terraform -y

# 2. Installer AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip && sudo ./aws/install

# 3. Configurer AWS CLI avec les credentials IAM
aws configure
# AWS Access Key ID     : [ta clé]
# AWS Secret Access Key : [ta clé secrète]
# Default region name   : us-west-2
# Default output format : json

# 4. Vérifier la connexion
aws sts get-caller-identity
# Doit afficher ton Account ID et le nom de l'utilisateur IAM
```

## Utilisation

```bash
# 1. Va dans ce dossier
cd 01-terraform-vpc-ec2

# 2. Copie le fichier de variables
cp terraform.tfvars.example terraform.tfvars

# 3. Initialise Terraform
terraform init
# → Télécharge le provider AWS (~20 secondes)

# 4. Prévisualise ce qui va être créé
terraform plan
# → Affiche : "Plan: 6 to add, 0 to change, 0 to destroy."

# 5. Crée les ressources !
terraform apply
# → Tape "yes" pour confirmer
# → Attends ~2 minutes
# → Affiche les outputs (IP publique de l'EC2, IDs des ressources...)

# 6. ⚠️ IMPORTANT : Supprime tout pour ne pas payer !
terraform destroy
```

## Ressources créées (6 au total)

| # | Ressource Terraform | Ce que c'est |
|---|---|---|
| 1 | `aws_vpc` | Le réseau privé principal |
| 2 | `aws_internet_gateway` | La porte vers internet |
| 3 | `aws_subnet` | Le sous-réseau public |
| 4 | `aws_route_table` + association | Les règles de routage du trafic |
| 5 | `aws_security_group` | Le pare-feu (HTTP:80 uniquement) |
| 6 | `aws_instance` | Le serveur EC2 t3.micro |

> **Note :** pas de `aws_key_pair` — la connexion SSH n'est pas nécessaire pour cette démo.

## Outputs affichés après terraform apply

```
vpc_id           = "vpc-0abc123..."
subnet_id        = "subnet-0def456..."
ec2_id           = "i-0ghi789..."
ec2_ip_publique  = "54.12.34.56"
ec2_ip_privee    = "10.0.1.10"
ami_utilisee     = "ami-0xyz..."
security_group_id = "sg-0abc..."
```

## Comprendre le state

Après `terraform apply`, un fichier `terraform.tfstate` est créé :

```json
{
  "resources": [
    {
      "type": "aws_vpc",
      "name": "main",
      "instances": [{ "attributes": { "id": "vpc-0abc123..." } }]
    }
  ]
}
```

**C'est la mémoire de Terraform.** Si tu le supprimes, Terraform ne sait plus ce qu'il a créé et ne peut plus le gérer.

## Structure des fichiers

| Fichier | Rôle |
|---|---|
| `main.tf` | Les ressources à créer (VPC, EC2...) |
| `variables.tf` | Déclaration des variables (région : `us-west-2`) |
| `outputs.tf` | Résultats affichés après apply |
| `terraform.tfvars` | Tes valeurs personnelles (à créer depuis `.example`) |
| `terraform.tfstate` | État actuel (généré automatiquement, ne pas supprimer) |
