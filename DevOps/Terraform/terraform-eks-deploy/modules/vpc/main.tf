# ============================================================
# modules/vpc/main.tf — VPC pour EKS
# ============================================================
# Crée :
#   - 1 VPC avec DNS activé
#   - 2 sous-réseaux publics  (Load Balancers, NAT Gateways)
#   - 2 sous-réseaux privés   (Nœuds EKS, pods)
#   - 1 Internet Gateway
#   - 2 NAT Gateways (HA — un par AZ)
#   - Tables de routage associées
# ============================================================

locals {
  name = "${var.project_name}-${var.environment}"

  # Prend les 2 premières AZ disponibles
  azs = slice(var.availability_zones, 0, 2)
}

# ── VPC ────────────────────────────────────────────────────────────────────────
resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = {
    Name = "${local.name}-vpc"
    # Tags requis par EKS pour la découverte automatique des sous-réseaux
    "kubernetes.io/cluster/${local.name}-cluster" = "shared"
  }
}

# ── Internet Gateway ───────────────────────────────────────────────────────────
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id
  tags   = { Name = "${local.name}-igw" }
}

# ── Sous-réseaux publics (1 par AZ) ───────────────────────────────────────────
resource "aws_subnet" "public" {
  count = length(local.azs)

  vpc_id                  = aws_vpc.main.id
  cidr_block              = cidrsubnet(var.vpc_cidr, 8, count.index)     # 10.0.0.0/24, 10.0.1.0/24
  availability_zone       = local.azs[count.index]
  map_public_ip_on_launch = true

  tags = {
    Name = "${local.name}-public-${local.azs[count.index]}"
    # Tag requis pour que EKS puisse créer des Load Balancers externes
    "kubernetes.io/role/elb"                                      = "1"
    "kubernetes.io/cluster/${local.name}-cluster"                 = "shared"
  }
}

# ── Sous-réseaux privés (1 par AZ) ────────────────────────────────────────────
resource "aws_subnet" "private" {
  count = length(local.azs)

  vpc_id            = aws_vpc.main.id
  cidr_block        = cidrsubnet(var.vpc_cidr, 8, count.index + 10)    # 10.0.10.0/24, 10.0.11.0/24
  availability_zone = local.azs[count.index]

  tags = {
    Name = "${local.name}-private-${local.azs[count.index]}"
    # Tag requis pour les Load Balancers internes (ALB internal)
    "kubernetes.io/role/internal-elb"                             = "1"
    "kubernetes.io/cluster/${local.name}-cluster"                 = "shared"
  }
}

# ── Elastic IPs pour les NAT Gateways ─────────────────────────────────────────
resource "aws_eip" "nat" {
  count  = length(local.azs)
  domain = "vpc"
  tags   = { Name = "${local.name}-eip-${local.azs[count.index]}" }

  depends_on = [aws_internet_gateway.main]
}

# ── NAT Gateways (1 par AZ pour la haute disponibilité) ───────────────────────
resource "aws_nat_gateway" "main" {
  count = length(local.azs)

  allocation_id = aws_eip.nat[count.index].id
  subnet_id     = aws_subnet.public[count.index].id

  tags = { Name = "${local.name}-nat-${local.azs[count.index]}" }
  depends_on = [aws_internet_gateway.main]
}

# ── Table de routage publique ─────────────────────────────────────────────────
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id
  tags   = { Name = "${local.name}-rt-public" }

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }
}

resource "aws_route_table_association" "public" {
  count          = length(local.azs)
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

# ── Tables de routage privées (1 par AZ → NAT Gateway dédié) ─────────────────
resource "aws_route_table" "private" {
  count  = length(local.azs)
  vpc_id = aws_vpc.main.id
  tags   = { Name = "${local.name}-rt-private-${local.azs[count.index]}" }

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.main[count.index].id
  }
}

resource "aws_route_table_association" "private" {
  count          = length(local.azs)
  subnet_id      = aws_subnet.private[count.index].id
  route_table_id = aws_route_table.private[count.index].id
}
