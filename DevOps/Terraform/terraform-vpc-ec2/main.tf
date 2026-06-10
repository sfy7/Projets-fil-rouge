# Ce que ce code crée :
#
#   Internet
#      │
#   [Internet Gateway]
#      │
#   [VPC 10.0.0.0/16]
#      │
#   [Subnet Public 10.0.1.0/24]
#      │
#   [EC2 t3.micro] ← mon serveur accessible depuis internet
#      │
#   [Security Group] ← pare-feu : autorise HTTP (80) uniquement
# ══════════════════════════════════════════════════════════════════════

terraform {
  required_version = ">= 1.3"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# ──────────────────────────────────────────────────────────────────────
# PROVIDER
# ──────────────────────────────────────────────────────────────────────
provider "aws" {
  region = var.aws_region
}

# ──────────────────────────────────────────────────────────────────────
# DATA SOURCE — AMI Amazon Linux 2 (récupère l'ID automatiquement)
# ──────────────────────────────────────────────────────────────────────
# L'ID d'une AMI change selon la région et le temps.
# Plutôt que de coder en dur "ami-0abc123", on laisse Terraform
# trouver automatiquement la plus récente.
data "aws_ami" "amazon_linux" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["amzn2-ami-hvm-*-x86_64-gp2"]
  }
}

# ──────────────────────────────────────────────────────────────────────
# RESOURCE 1 : VPC (Virtual Private Cloud)
# C'est mon réseau privé sur AWS — tout le reste vivra dedans
# ──────────────────────────────────────────────────────────────────────
resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr       # Plage d'IPs : 10.0.0.0 → 10.0.255.255
  enable_dns_hostnames = true               # Les instances auront un nom DNS
  enable_dns_support   = true

  tags = {
    Name = "${var.projet}-vpc"
  }
}

# ──────────────────────────────────────────────────────────────────────
# RESOURCE 2 : Internet Gateway
# La "porte d'entrée" entre internet et mon VPC
# ──────────────────────────────────────────────────────────────────────
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id # ← attaché au VPC créé juste au-dessus

  tags = {
    Name = "${var.projet}-igw"
  }
}

# ──────────────────────────────────────────────────────────────────────
# RESOURCE 3 : Subnet Public
# Une sous-division du VPC. "Public" = accessible depuis internet
# ──────────────────────────────────────────────────────────────────────
resource "aws_subnet" "public" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = var.subnet_cidr      # 10.0.1.0 → 10.0.1.255 (256 IPs)
  availability_zone       = "${var.aws_region}a" # ex: eu-west-1a
  map_public_ip_on_launch = true                 # L'EC2 reçoit une IP publique automatiquement

  tags = {
    Name = "${var.projet}-subnet-public"
  }
}

# ──────────────────────────────────────────────────────────────────────
# RESOURCE 4 : Route Table
# Définit comment router le trafic dans le subnet
# ──────────────────────────────────────────────────────────────────────
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  # Toute destination (0.0.0.0/0) → passe par l'Internet Gateway
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = {
    Name = "${var.projet}-rt-public"
  }
}

# Associe la route table au subnet (sinon la route ne s'applique pas !)
resource "aws_route_table_association" "public" {
  subnet_id      = aws_subnet.public.id
  route_table_id = aws_route_table.public.id
}

# ──────────────────────────────────────────────────────────────────────
# RESOURCE 5 : Security Group (pare-feu)
# Contrôle le trafic entrant et sortant de l'EC2
# ──────────────────────────────────────────────────────────────────────
resource "aws_security_group" "ec2" {
  name        = "${var.projet}-sg-ec2"
  description = "Security Group pour EC2 demo"
  vpc_id      = aws_vpc.main.id

  # ─── Trafic ENTRANT (ingress) ───────────────────────────────
  ingress {
    description = "HTTP acces web"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # ─── Trafic SORTANT (egress) ────────────────────────────────
  egress {
    description = "Tout autoriser en sortie"
    from_port   = 0
    to_port     = 0
    protocol    = "-1" # -1 = tous protocoles
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.projet}-sg-ec2"
  }
}

# ──────────────────────────────────────────────────────────────────────
# RESOURCE 6 : Instance EC2
# Le serveur virtuel dans mon VPC
# ──────────────────────────────────────────────────────────────────────
resource "aws_instance" "demo" {
  ami                    = data.aws_ami.amazon_linux.id # AMI récupérée automatiquement
  instance_type          = var.instance_type
  subnet_id              = aws_subnet.public.id
  vpc_security_group_ids = [aws_security_group.ec2.id]
  user_data_replace_on_change = true  # Force la recréation si le user_data change

  # Script exécuté au premier démarrage du serveur
  user_data = <<EOF
  #!/bin/bash
  yum update -y
  yum install -y httpd
  systemctl start httpd
  systemctl enable httpd
  echo "<h1>Portfolio EC2 - Terraform Demo reussi !</h1>" > /var/www/html/index.html
  EOF


  lifecycle {
    prevent_destroy = false # Mettre à true en production !
  }

  tags = {
    Name = "${var.projet}-ec2-demo"
  }
}
