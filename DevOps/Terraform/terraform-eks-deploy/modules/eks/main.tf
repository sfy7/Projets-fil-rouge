# ============================================================
# modules/eks/main.tf — Cluster EKS + Node Group
# ============================================================
# Crée :
#   - Rôle IAM du cluster EKS
#   - Cluster EKS (plan de contrôle managé par AWS)
#   - Rôle IAM des nœuds worker
#   - Node Group managé (EC2 Auto Scaling)
#   - Add-ons EKS : CoreDNS, kube-proxy, VPC CNI, EBS CSI Driver
#   - OIDC Provider (requis pour les IAM Roles for Service Accounts)
# ============================================================

locals {
  cluster_name = "${var.project_name}-${var.environment}-cluster"
}

# ── IAM — Rôle du cluster EKS ─────────────────────────────────────────────────
resource "aws_iam_role" "eks_cluster" {
  name = "${local.cluster_name}-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "eks.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy_attachment" "eks_cluster_policy" {
  role       = aws_iam_role.eks_cluster.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy"
}

# ── Security Group du cluster ─────────────────────────────────────────────────
resource "aws_security_group" "eks_cluster" {
  name        = "${local.cluster_name}-sg"
  description = "Security group du cluster EKS"
  vpc_id      = var.vpc_id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Sortie internet autorisee (telechargement images, API)"
  }

  tags = { Name = "${local.cluster_name}-sg" }
}

# ── Cluster EKS ───────────────────────────────────────────────────────────────
resource "aws_eks_cluster" "main" {
  name     = local.cluster_name
  version  = var.k8s_version
  role_arn = aws_iam_role.eks_cluster.arn

  vpc_config {
    subnet_ids              = concat(var.private_subnet_ids, var.public_subnet_ids)
    security_group_ids      = [aws_security_group.eks_cluster.id]
    endpoint_private_access = true    # kubectl depuis le VPC
    endpoint_public_access  = true    # kubectl depuis internet (à restreindre en prod)
  }

  # Logs du plan de contrôle vers CloudWatch
  enabled_cluster_log_types = ["api", "audit", "authenticator", "controllerManager", "scheduler"]

  depends_on = [aws_iam_role_policy_attachment.eks_cluster_policy]
}

# ── OIDC Provider (IAM Roles for Service Accounts) ───────────────────────────
data "tls_certificate" "eks" {
  url = aws_eks_cluster.main.identity[0].oidc[0].issuer
}

resource "aws_iam_openid_connect_provider" "eks" {
  client_id_list  = ["sts.amazonaws.com"]
  thumbprint_list = [data.tls_certificate.eks.certificates[0].sha1_fingerprint]
  url             = aws_eks_cluster.main.identity[0].oidc[0].issuer
}

# ── IAM — Rôle des nœuds worker ───────────────────────────────────────────────
resource "aws_iam_role" "eks_nodes" {
  name = "${local.cluster_name}-nodes-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "ec2.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy_attachment" "eks_worker_node_policy" {
  role       = aws_iam_role.eks_nodes.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy"
}

resource "aws_iam_role_policy_attachment" "eks_cni_policy" {
  role       = aws_iam_role.eks_nodes.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy"
}

resource "aws_iam_role_policy_attachment" "ecr_read_only" {
  role       = aws_iam_role.eks_nodes.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
}

# EBS CSI Driver — lecture/écriture pour les PersistentVolumes
resource "aws_iam_role_policy_attachment" "ebs_csi" {
  role       = aws_iam_role.eks_nodes.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonEBSCSIDriverPolicy"
}

# ── Node Group managé ─────────────────────────────────────────────────────────
resource "aws_eks_node_group" "main" {
  cluster_name    = aws_eks_cluster.main.name
  node_group_name = "${local.cluster_name}-ng"
  node_role_arn   = aws_iam_role.eks_nodes.arn
  subnet_ids      = var.private_subnet_ids   # Nœuds dans les sous-réseaux privés

  instance_types = [var.node_instance_type]
  ami_type       = "AL2_x86_64"             # Amazon Linux 2 — recommandé EKS
  disk_size      = 20                        # GB par nœud

  scaling_config {
    desired_size = var.node_desired_size
    min_size     = var.node_min_size
    max_size     = var.node_max_size
  }

  update_config {
    max_unavailable = 1   # Mise à jour progressive : 1 nœud hors service à la fois
  }

  # Lifecycle : ignore les changements de taille gérés par l'Auto Scaler
  lifecycle {
    ignore_changes = [scaling_config[0].desired_size]
  }

  depends_on = [
    aws_iam_role_policy_attachment.eks_worker_node_policy,
    aws_iam_role_policy_attachment.eks_cni_policy,
    aws_iam_role_policy_attachment.ecr_read_only,
  ]

  tags = { Name = "${local.cluster_name}-node" }
}

# ── Add-ons EKS ───────────────────────────────────────────────────────────────
resource "aws_eks_addon" "coredns" {
  cluster_name                = aws_eks_cluster.main.name
  addon_name                  = "coredns"
  resolve_conflicts_on_create = "OVERWRITE"
  depends_on                  = [aws_eks_node_group.main]
}

resource "aws_eks_addon" "kube_proxy" {
  cluster_name                = aws_eks_cluster.main.name
  addon_name                  = "kube-proxy"
  resolve_conflicts_on_create = "OVERWRITE"
}

resource "aws_eks_addon" "vpc_cni" {
  cluster_name                = aws_eks_cluster.main.name
  addon_name                  = "vpc-cni"
  resolve_conflicts_on_create = "OVERWRITE"
}

resource "aws_eks_addon" "ebs_csi_driver" {
  cluster_name                = aws_eks_cluster.main.name
  addon_name                  = "aws-ebs-csi-driver"
  resolve_conflicts_on_create = "OVERWRITE"
  depends_on                  = [aws_eks_node_group.main]
}
