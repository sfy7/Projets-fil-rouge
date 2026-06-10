# ══════════════════════════════════════════════════════════════════════
# outputs.tf — Informations affichées après terraform apply
# ══════════════════════════════════════════════════════════════════════
#
# Après terraform apply:
#   Outputs:
#     ec2_ip_publique = "54.12.34.56"
#     vpc_id          = "vpc-0abc123..."
#     ...
# ══════════════════════════════════════════════════════════════════════

output "vpc_id" {
  description = "L'ID du VPC créé"
  value       = aws_vpc.main.id
}

output "subnet_id" {
  description = "L'ID du subnet public"
  value       = aws_subnet.public.id
}

output "ec2_id" {
  description = "L'ID de l'instance EC2"
  value       = aws_instance.demo.id
}

output "ec2_ip_publique" {
  description = "L'IP publique de l'EC2 — accès depuis internet"
  value       = aws_instance.demo.public_ip
}

output "ec2_ip_privee" {
  description = "L'IP privée de l'EC2 — accès interne au VPC uniquement"
  value       = aws_instance.demo.private_ip
}

output "ami_utilisee" {
  description = "L'AMI Amazon Linux choisie automatiquement"
  value       = data.aws_ami.amazon_linux.id
}

output "security_group_id" {
  description = "L'ID du security group"
  value       = aws_security_group.ec2.id
}
