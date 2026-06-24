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
  }

  required_version = ">= 1.2"
}

variable "aws_region" {
  description = "AWS region used for the application host."
  type        = string
  default     = "eu-west-3"
}

variable "project_name" {
  description = "Prefix used to name application resources."
  type        = string
  default     = "ynov-cicd-app"
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

variable "frontend_port" {
  description = "Public frontend HTTP port."
  type        = number
  default     = 80
}

variable "backend_port" {
  description = "Public backend API port."
  type        = number
  default     = 8000
}

provider "aws" {
  region = var.aws_region
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

resource "aws_security_group" "application" {
  name_prefix = "${var.project_name}-"
  description = "Allow frontend, API, and Ansible SSH access"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    description = "SSH for Ansible"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.admin_cidr]
  }

  ingress {
    description = "Public frontend"
    from_port   = var.frontend_port
    to_port     = var.frontend_port
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "Public API"
    from_port   = var.backend_port
    to_port     = var.backend_port
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

resource "aws_instance" "application" {
  ami                         = data.aws_ami.ubuntu_lts.id
  instance_type               = var.instance_type
  key_name                    = aws_key_pair.generated.key_name
  subnet_id                   = sort(data.aws_subnets.default.ids)[0]
  associate_public_ip_address = true
  vpc_security_group_ids      = [aws_security_group.application.id]

  root_block_device {
    volume_size = 20
    volume_type = "gp3"
  }

  tags = {
    Name = var.project_name
  }
}

output "public_ip" {
  description = "Public IP of the application EC2 instance."
  value       = aws_instance.application.public_ip
}

output "ssh_user" {
  description = "SSH user for the selected Ubuntu AMI."
  value       = "ubuntu"
}

output "private_key_pem" {
  description = "Generated SSH private key for Ansible."
  value       = tls_private_key.ssh.private_key_pem
  sensitive   = true
}

output "frontend_url" {
  description = "Frontend URL exposed by the application host."
  value       = "http://${aws_instance.application.public_ip}/ynov-cicd/"
}

output "backend_health_url" {
  description = "Backend health endpoint exposed by the application host."
  value       = "http://${aws_instance.application.public_ip}:8000/health"
}
