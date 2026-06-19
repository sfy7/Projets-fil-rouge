# Monitoring - Stack Prometheus & Grafana

Stack d'observabilite complete pour le projet Portfolio fullstack, deployee via Docker Compose.

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

### Composants

| Service | Port | Role |
|---------|------|------|
| Prometheus | 9090 | Collecte et stockage des metriques time-series |
| Grafana | 3000 | Visualisation (dashboards) |
| Alertmanager | 9093 | Routage et envoi des alertes par email |
| Node Exporter | 9100 | Metriques systeme (CPU, RAM, disque, reseau) |
| cAdvisor | 8082 | Metriques containers Docker |
| MongoDB Exporter | 9216 | Metriques MongoDB |
| Blackbox Exporter | 9115 | Probes HTTP/TCP (disponibilite) |
| kube-state-metrics | 30081 | Metriques cluster Kubernetes (via port-forward) |

## Demarrage

```bash
# Lancer la stack applicative + monitoring
docker compose -f docker-compose.yaml -f Monitoring/docker-compose.monitoring.yml up -d
kubectl apply -f Monitoring/kubernetes/ --recursive

# Lancer le port-forward Kubernetes (pour les metriques Minikube)
sudo systemctl start k8s-portforward
```

## Acces

| Interface | URL | Identifiants |
|-----------|-----|--------------|
| Prometheus | http://localhost:9090 | - |
| Grafana | http://localhost:3000 | admin / p@sser123 |
| Alertmanager | http://localhost:9093 | - |

## Structure des fichiers

```
Monitoring/
├── docker-compose.monitoring.yml    # Stack Docker Compose monitoring
├── prometheus/
│   ├── prometheus.yml               # Configuration scrape targets
│   └── alerts/
│       ├── system_alerts.yml        # Alertes systeme (CPU, RAM, disque)
│       ├── container_alerts.yml     # Alertes containers Docker
│       ├── application_alerts.yml   # Alertes Backend, Jenkins, MongoDB
│       └── kubernetes_alerts.yml    # Alertes cluster Kubernetes
├── grafana/
│   ├── grafana.ini                  # Configuration Grafana
│   ├── provisioning/
│   │   ├── datasources/
│   │   │   └── datasources.yml     # Datasource Prometheus auto-provisionnee
│   │   └── dashboards/
│   │       └── dashboards.yml      # Provisioning des dashboards
│   └── dashboards/
│       ├── system-overview.json     # Dashboard systeme (Node Exporter)
│       ├── containers-docker.json   # Dashboard containers (cAdvisor)
│       ├── backend-api.json         # Dashboard Backend Express.js
│       ├── jenkins-cicd.json        # Dashboard Jenkins CI/CD
│       └── kubernetes-cluster.json  # Dashboard Kubernetes (Minikube)
├── kubernetes/
│   ├── namespace.yaml              # Namespace "monitoring" dans Minikube
│   ├── node-exporter/
│   │   └── daemonset.yaml          # DaemonSet Node Exporter dans Minikube
│   └── kube-state-metrics/
│       └── deployment.yaml         # Deployment + RBAC + Service NodePort
└── exporters/
    └── blackbox.yml                # Configuration probes Blackbox
```

## Dashboards Grafana

### 1. System Overview
Metriques hote via Node Exporter : utilisation CPU, memoire, espace disque, trafic reseau.

### 2. Containers Docker
Metriques via cAdvisor : CPU, memoire, reseau par container, nombre de containers actifs.

### 3. Backend API
Metriques applicatives via prom-client : requetes/sec par status HTTP, latence (P50/P95/P99), taux d'erreurs, heap memory Node.js, event loop lag.

### 4. Jenkins CI/CD
Metriques via le plugin Prometheus Metrics : builds (success/failed/aborted), duree des builds, queue length, executors, health score.

### 5. Kubernetes Cluster
Metriques via kube-state-metrics : pods par phase, restarts, pods ready, deployments ready vs desired, CPU/memory requests, utilisation du node.

## Alertes

Les alertes sont evaluees toutes les 15 secondes. Quand une condition est remplie pendant la duree `for`, Alertmanager envoie un email.

### Severites

- **critical** : action immediate requise (service down, disque plein)
- **warning** : a surveiller (charge elevee, latence)

### Liste des alertes

| Alerte | Condition | Severite |
|--------|-----------|----------|
| HighCpuUsage | CPU > 80% pendant 5 min | warning |
| HighMemoryUsage | RAM > 85% pendant 5 min | warning |
| DiskSpaceLow | Disque > 85% pendant 10 min | critical |
| NodeDown | Machine inaccessible | critical |
| ContainerHighRestartCount | > 3 restarts en 15 min | warning |
| ContainerDown | backend/frontend/mongo absent | critical |
| BackendHighErrorRate | > 5% erreurs HTTP 5xx | critical |
| BackendHighLatency | P95 > 2s pendant 5 min | warning |
| BackendDown | API inaccessible | critical |
| JenkinsDown | Jenkins inaccessible | critical |
| KubePodCrashLooping | Pod restart en boucle | critical |
| KubePodNotReady | Pod non pret depuis 5 min | warning |
| KubeNodeNotReady | Node Minikube down | critical |

## Configuration requise

### Variables d'environnement (.env)

```env
SMTP_HOST=smtp.gmail.com
SMTP_FROM=votre-email@gmail.com
SMTP_USERNAME=votre-email@gmail.com
SMTP_PASSWORD=xxxx-xxxx-xxxx-xxxx    # Token d'application Gmail
ALERT_EMAIL_TO=destinataire@email.com
```

### Prerequis

- Docker + Docker Compose
- Minikube (pour les metriques Kubernetes)
- Plugin "Prometheus Metrics" installe dans Jenkins
- Middleware prom-client integre dans le Backend (`/metrics`)
- `/etc/docker/daemon.json` avec `{"storage-driver": "overlay2"}` (pour cAdvisor + cgroups v2)

### Service systemd pour le port-forward Kubernetes

```bash
# Le service est configure dans /etc/systemd/system/k8s-portforward.service
# Il expose kube-state-metrics (30081) et node-exporter (9101) vers l'hote
sudo systemctl enable k8s-portforward
sudo systemctl start k8s-portforward
```

### Regles iptables

```bash
sudo iptables -I INPUT -i docker0 -p tcp --dport 30081 -j ACCEPT
sudo iptables -I INPUT -i docker0 -p tcp --dport 9101 -j ACCEPT
```

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
