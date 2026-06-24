# Final AWS Deployment Architecture

## Overview

The final deployment uses two AWS EC2 instances in `eu-west-3`.

- Registry EC2: private Docker registry exposed over HTTPS on port 443.
- Application EC2: Docker Compose host for the frontend, backend, MySQL, and Adminer.

No server is configured manually over an interactive SSH session. Terraform creates the
instances and generates short-lived SSH keys. The registry Terraform root writes the local
Ansible bridge files during bootstrap; the application workflow writes its bridge files only
inside the GitHub Actions runner.

## Registry Infrastructure

Registry files live under `infrastructure/registry/`.

- `terraform/`: creates the registry EC2, security group, generated SSH key, and outputs.
  `terraform apply` also writes `ansible/inventory.ini` and `ansible/key.pem` for the
  registry playbook.
- `ansible/`: installs Docker, creates a self-signed HTTPS certificate, configures Nginx,
  enables basic authentication, and starts the registry stack.

The registry security group exposes:

- `22/tcp` for Ansible SSH.
- `443/tcp` for the Docker registry API and registry UI.

Registry credentials must be supplied through environment variables or GitHub Secrets:

- `REGISTRY_USERNAME`
- `REGISTRY_PASSWORD`

## Application Infrastructure

Application files live under `infrastructure/application/`.

- `terraform/`: creates a second EC2 instance for the application stack.
- `ansible/`: installs Docker, trusts the private registry certificate, logs into the
  registry, copies database migrations, renders the production Compose file, and starts the
  stack.

The application security group exposes:

- `22/tcp` for Ansible SSH.
- `80/tcp` for the frontend.
- `8000/tcp` for the backend API.

MySQL is not published publicly. Adminer is bound to `127.0.0.1:8081` on the EC2 host, so it
is not reachable from the public internet.

## Manual Deployment Flow

The required manual deployment workflow is `.github/workflows/deploy.yml`.

It runs only through `workflow_dispatch` and performs these stages:

1. Build the backend Docker image.
2. Build the frontend Docker image with `VITE_API_URL=/api`.
3. Push both images to the private registry.
4. Apply Terraform for the ephemeral application EC2.
5. Export Terraform outputs into `key.pem`, `inventory.ini`, and runner environment vars.
6. Run the application Ansible playbook.
7. Validate the deployment with `curl` against:
   - `http://<app-ip>/ynov-cicd/`
   - `http://<app-ip>:8000/health`
   - `http://<app-ip>/api/health`

## Required GitHub Secrets

See `.env.sample` for the complete list. Do not commit real AWS keys or passwords.

Required for the manual deploy workflow:

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `REGISTRY_HOST`
- `REGISTRY_USERNAME`
- `REGISTRY_PASSWORD`
- `MYSQL_ROOT_PASSWORD`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `MYSQL_DATABASE`
- `CORS_ORIGINS`

## Registry Bootstrap

The registry must exist before `.github/workflows/deploy.yml` can push images to it.
Bootstrap it from `infrastructure/registry/terraform`, then run the registry playbook from
`infrastructure/registry/ansible`.

`terraform apply` generates:

- `infrastructure/registry/ansible/inventory.ini`
- `infrastructure/registry/ansible/key.pem`

Then run:

```bash
cd infrastructure/registry/ansible
REGISTRY_USERNAME=<username> REGISTRY_PASSWORD=<password> ansible-playbook deploy.yml
```

Save the registry public IP from `terraform output -raw registry_host` as the `REGISTRY_HOST`
GitHub Secret.
