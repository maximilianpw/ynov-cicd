terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.92"
    }
    tls = {
      source  = "hashicorp/tls"
      version = "~> 4.0"
    }
    local = {
      source  = "hashicorp/local"
      version = "~> 2.5"
    }
  }

  required_version = ">= 1.2"
}

variable "aws_region" {
  description = "AWS region used for the registry host."
  type        = string
  default     = "eu-west-3"
}

variable "project_name" {
  description = "Prefix used to name registry resources."
  type        = string
  default     = "ynov-cicd-registry"
}

variable "instance_type" {
  description = "Free Tier-compatible instance type."
  type        = string
  default     = "t3.micro"
}

variable "admin_cidr" {
  description = "CIDR allowed to connect over SSH for Ansible."
  type        = string
  default     = "0.0.0.0/0"
}

variable "ansible_inventory_path" {
  description = "Path where Terraform writes the generated registry Ansible inventory."
  type        = string
  default     = "../ansible/inventory.ini"
}

variable "ansible_private_key_path" {
  description = "Path where Terraform writes the generated registry SSH private key for Ansible."
  type        = string
  default     = "../ansible/key.pem"
}

provider "aws" {
  region = var.aws_region
}

locals {
  ssh_user                 = "ubuntu"
  registry_public_ip       = aws_instance.registry.public_ip
  ansible_inventory_path   = abspath(var.ansible_inventory_path)
  ansible_private_key_path = abspath(var.ansible_private_key_path)
  ansible_inventory        = <<-EOT
  [registry]
  registry_server ansible_host=${local.registry_public_ip} ansible_user=${local.ssh_user} ansible_ssh_private_key_file=${local.ansible_private_key_path} public_ip=${local.registry_public_ip} ansible_ssh_common_args='-o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null'
  EOT
}

data "aws_ami" "ubuntu_lts" {
  most_recent = true
  owners      = ["099720109477"]

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd-gp3/ubuntu-noble-24.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

resource "tls_private_key" "ssh" {
  algorithm = "RSA"
  rsa_bits  = 4096
}

resource "aws_key_pair" "generated" {
  key_name_prefix = "${var.project_name}-"
  public_key      = tls_private_key.ssh.public_key_openssh
}

resource "aws_security_group" "registry" {
  name_prefix = "${var.project_name}-"
  description = "Allow Ansible SSH and HTTPS access to the private registry"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    description = "SSH for Ansible"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.admin_cidr]
  }

  ingress {
    description = "HTTPS registry and UI"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-sg"
  }
}

resource "aws_instance" "registry" {
  ami                         = data.aws_ami.ubuntu_lts.id
  instance_type               = var.instance_type
  key_name                    = aws_key_pair.generated.key_name
  subnet_id                   = sort(data.aws_subnets.default.ids)[0]
  associate_public_ip_address = true
  vpc_security_group_ids      = [aws_security_group.registry.id]

  root_block_device {
    volume_size = 20
    volume_type = "gp3"
  }

  tags = {
    Name = var.project_name
  }
}

resource "local_sensitive_file" "ansible_private_key" {
  filename        = local.ansible_private_key_path
  content         = tls_private_key.ssh.private_key_pem
  file_permission = "0600"
}

resource "local_file" "ansible_inventory" {
  filename        = local.ansible_inventory_path
  content         = local.ansible_inventory
  file_permission = "0644"
}

output "public_ip" {
  description = "Public IP of the Docker registry EC2 instance."
  value       = local.registry_public_ip
}

output "ssh_user" {
  description = "SSH user for the selected Ubuntu AMI."
  value       = local.ssh_user
}

output "private_key_pem" {
  description = "Generated SSH private key for Ansible."
  value       = tls_private_key.ssh.private_key_pem
  sensitive   = true
}

output "registry_host" {
  description = "Registry host to use in docker login and image names."
  value       = local.registry_public_ip
}

output "ansible_inventory_path" {
  description = "Generated Ansible inventory path for the registry playbook."
  value       = local_file.ansible_inventory.filename
}

output "ansible_private_key_path" {
  description = "Generated SSH private key path for the registry playbook."
  value       = local_sensitive_file.ansible_private_key.filename
}
