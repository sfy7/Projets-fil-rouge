<div align="center">

# Monitoring - Stack Prometheus & Grafana

![Prometheus](https://img.shields.io/badge/Prometheus-E6522C?style=for-the-badge&logo=prometheus&logoColor=white)
![Grafana](https://img.shields.io/badge/Grafana-F46800?style=for-the-badge&logo=grafana&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Kubernetes](https://img.shields.io/badge/Kubernetes-326CE5?style=for-the-badge&logo=kubernetes&logoColor=white)

**Stack d'observabilite complete pour le projet Portfolio fullstack, deployee via Docker Compose.**

</div>

---

## Architecture

```
+------------------+       +-------------+       +--------------+
|   Grafana :3000  | <---- | Prometheus  | <---- |  Exporters   |
|   (dashboards)   |       |   :9090     |       |  (metriques) |
+------------------+       +------+------+       +--------------+
                                  |
                           +------+------+
                           | Alertmanager|----> Email (SMTP)
                           |   :9093     |
                           +-------------+
```

---

## Composants

| Service | Port | Role |
|:--------|:----:|:-----|
| ![Prometheus](https://img.shields.io/badge/Prometheus-E6522C?style=flat-square&logo=prometheus&logoColor=white) | `9090` | Collecte et stockage des metriques time-series |
| ![Grafana](https://img.shields.io/badge/Grafana-F46800?style=flat-square&logo=grafana&logoColor=white) | `3000` | Visualisation (dashboards) |
| ![Alertmanager](https://img.shields.io/badge/Alertmanager-E6522C?style=flat-square&logoColor=white) | `9093` | Routage et envoi des alertes par email |
| ![Node Exporter](https://img.shields.io/badge/Node_Exporter-36B37E?style=flat-square&logoColor=white) | `9100` | Metriques systeme (CPU, RAM, disque, reseau) |
| ![cAdvisor](https://img.shields.io/badge/cAdvisor-2496ED?style=flat-square&logo=docker&logoColor=white) | `8082` | Metriques containers Docker |
| ![MongoDB](https://img.shields.io/badge/MongoDB_Exporter-47A248?style=flat-square&logo=mongodb&logoColor=white) | `9216` | Metriques MongoDB |
| ![Blackbox](https://img.shields.io/badge/Blackbox_Exporter-7B68EE?style=flat-square&logoColor=white) | `9115` | Probes HTTP/TCP (disponibilite) |
| ![KSM](https://img.shields.io/badge/kube--state--metrics-326CE5?style=flat-square&logo=kubernetes&logoColor=white) | `30081` | Metriques cluster Kubernetes (via port-forward) |

---

## Demarrage rapide

```bash
# Lancer la stack applicative + monitoring
docker compose -f docker-compose.yaml -f Monitoring/docker-compose.monitoring.yml up -d
kubectl apply -f Monitoring/kubernetes/ --recursive

# Lancer le port-forward Kubernetes (pour les metriques Minikube)
sudo systemctl start k8s-portforward
```

---

## Acces aux interfaces

| Interface | URL | Identifiants |
|:----------|:----|:-------------|
| ![Prometheus](https://img.shields.io/badge/-Prometheus-E6522C?style=flat-square) | http://localhost:9090 | — |
| ![Grafana](https://img.shields.io/badge/-Grafana-F46800?style=flat-square) | http://localhost:3000 | `admin` / `p@sser123` |
| ![Alertmanager](https://img.shields.io/badge/-Alertmanager-E6522C?style=flat-square) | http://localhost:9093 | — |

---

## Structure des fichiers

```
Monitoring/
├── docker-compose.monitoring.yml
├── prometheus/
│   ├── prometheus.yml
│   └── alerts/
│       ├── system_alerts.yml
│       ├── container_alerts.yml
│       ├── application_alerts.yml
│       └── kubernetes_alerts.yml
├── grafana/
│   ├── grafana.ini
│   ├── provisioning/
│   │   ├── datasources/
│   │   │   └── datasources.yml
│   │   └── dashboards/
│   │       └── dashboards.yml
│   └── dashboards/
│       ├── system-overview.json
│       ├── containers-docker.json
│       ├── backend-api.json
│       ├── jenkins-cicd.json
│       ├── mongodb.json
│       └── kubernetes-cluster.json
├── kubernetes/
│   ├── namespace.yaml
│   ├── node-exporter/
│   │   └── daemonset.yaml
│   └── kube-state-metrics/
│       └── deployment.yaml
└── exporters/
    └── blackbox.yml
```

---

## Dashboards Grafana

| # | Dashboard | Description |
|:-:|:----------|:------------|
| 1 | **System Overview** | Metriques hote via Node Exporter : CPU, memoire, espace disque, trafic reseau |
| 2 | **Containers Docker** | Metriques via cAdvisor : CPU, memoire, reseau par container, containers actifs |
| 3 | **Backend API** | Metriques applicatives via prom-client : requetes/sec, latence P50/P95/P99, taux d'erreurs, heap memory, event loop lag |
| 4 | **Jenkins CI/CD** | Metriques via plugin Prometheus : builds success/failed/aborted, duree, queue, executors, health score |
| 5 | **MongoDB** | Metriques via MongoDB Exporter : connexions, operations/sec, memoire, network I/O, curseurs, uptime |
| 6 | **Kubernetes Cluster** | Metriques via kube-state-metrics : pods par phase, restarts, deployments, CPU/memory requests |

---

## Alertes

Les alertes sont evaluees toutes les **15 secondes**. Quand une condition est remplie pendant la duree `for`, Alertmanager envoie un email.

### Severites

| Niveau | Description |
|:-------|:------------|
| ![Critical](https://img.shields.io/badge/CRITICAL-DC3545?style=flat-square) | Action immediate requise (service down, disque plein) |
| ![Warning](https://img.shields.io/badge/WARNING-FFC107?style=flat-square&logoColor=black) | A surveiller (charge elevee, latence) |

### Liste des alertes

| Alerte | Condition | Severite |
|:-------|:----------|:--------:|
| HighCpuUsage | CPU > 80% pendant 5 min | ![warning](https://img.shields.io/badge/-warning-FFC107?style=flat-square&logoColor=black) |
| HighMemoryUsage | RAM > 85% pendant 5 min | ![warning](https://img.shields.io/badge/-warning-FFC107?style=flat-square&logoColor=black) |
| DiskSpaceLow | Disque > 85% pendant 10 min | ![critical](https://img.shields.io/badge/-critical-DC3545?style=flat-square) |
| NodeDown | Machine inaccessible | ![critical](https://img.shields.io/badge/-critical-DC3545?style=flat-square) |
| ContainerHighRestartCount | > 3 restarts en 15 min | ![warning](https://img.shields.io/badge/-warning-FFC107?style=flat-square&logoColor=black) |
| ContainerDown | backend/frontend/mongo absent | ![critical](https://img.shields.io/badge/-critical-DC3545?style=flat-square) |
| BackendHighErrorRate | > 5% erreurs HTTP 5xx | ![critical](https://img.shields.io/badge/-critical-DC3545?style=flat-square) |
| BackendHighLatency | P95 > 2s pendant 5 min | ![warning](https://img.shields.io/badge/-warning-FFC107?style=flat-square&logoColor=black) |
| BackendDown | API inaccessible | ![critical](https://img.shields.io/badge/-critical-DC3545?style=flat-square) |
| JenkinsDown | Jenkins inaccessible | ![critical](https://img.shields.io/badge/-critical-DC3545?style=flat-square) |
| KubePodCrashLooping | Pod restart en boucle | ![critical](https://img.shields.io/badge/-critical-DC3545?style=flat-square) |
| KubePodNotReady | Pod non pret depuis 5 min | ![warning](https://img.shields.io/badge/-warning-FFC107?style=flat-square&logoColor=black) |
| KubeNodeNotReady | Node Minikube down | ![critical](https://img.shields.io/badge/-critical-DC3545?style=flat-square) |

---

## Configuration requise

### Variables d'environnement (`.env`)

```env
SMTP_HOST=smtp.gmail.com
SMTP_FROM=votre-email@gmail.com
SMTP_USERNAME=votre-email@gmail.com
SMTP_PASSWORD=xxxx-xxxx-xxxx-xxxx    # Token d'application Gmail
ALERT_EMAIL_TO=destinataire@email.com
```

### Prerequis

- **Docker** + Docker Compose
- **Minikube** (pour les metriques Kubernetes)
- Plugin **Prometheus Metrics** installe dans Jenkins
- Middleware **prom-client** integre dans le Backend (`/metrics`)
- `/etc/docker/daemon.json` avec `{"storage-driver": "overlay2"}` (pour cAdvisor + cgroups v2)

### Service systemd pour le port-forward Kubernetes

```bash
# Configure dans /etc/systemd/system/k8s-portforward.service
# Expose kube-state-metrics (30081) et node-exporter (9101) vers l'hote
sudo systemctl enable k8s-portforward
sudo systemctl start k8s-portforward
```

### Regles iptables

```bash
sudo iptables -I INPUT -i docker0 -p tcp --dport 30081 -j ACCEPT
sudo iptables -I INPUT -i docker0 -p tcp --dport 9101 -j ACCEPT
```

---

## Commandes utiles

```bash
# Redemarrer la stack monitoring
docker compose -f docker-compose.yaml -f Monitoring/docker-compose.monitoring.yml restart

# Recharger la config Prometheus (sans redemarrer)
curl -X POST http://localhost:9090/-/reload

# Verifier les targets Prometheus
# http://localhost:9090/targets

# Voir les alertes actives
# http://localhost:9093/#/alerts

# Deployer les manifests Kubernetes
kubectl apply -f Monitoring/kubernetes/ --recursive

# Verifier kube-state-metrics
kubectl get pods -n monitoring
```

---

<div align="center">

**Safietou** | Portfolio DevOps

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com)
[![Email](https://img.shields.io/badge/Email-EA4335?style=for-the-badge&logo=gmail&logoColor=white)](mailto:safietou0218@gmail.com)

</div>
