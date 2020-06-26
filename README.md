# Node on Kube

1. Backend
   - certificates
   - app: node.js
   - (reverse) proxy: nginx
1. Ingress
1. Destroy k8s applications

---

## Backend

### Build Node.js Docker Image

```bash
docker build -t node-app -f backend/app/Dockerfile node-app
```

### Nginx Configurations

```bash
kubectl apply -f backend/proxy/configmap.yml
```

### Deploy Backend Service

```bash
kubectl apply -f backend/deploy.yml
```

---

## Ingress

### NGINX Ingress Controller for Kubernetes

- [kubernetes/ingress-nginx](https://github.com/kubernetes/ingress-nginx)
- [Installation Guide](https://kubernetes.github.io/ingress-nginx/deploy/#contents)

#### Install a ingress controller

##### Docker for Mac

```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/master/deploy/static/provider/cloud/deploy.yaml
```

##### minikube

For standard usage:

```bash
minikube addons enable ingress
```

For development:

```bash
# Disable the ingress addon:
minikube addons disable ingress
make dev-env
kubectl get pods -n ingress-nginx
```

##### Using Helm 2

```bash
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx/
helm install --name ingress-nginx ingress-nginx/ingress-nginx
```

#### Verify Installation

```bash
kubectl get pods -n ingress-nginx -l app.kubernetes.io/name=ingress-nginx --watch
```

Once the ingress controller pods are running, you can cancel the command typing `Ctrl+C`.

### SSL Certificate

Read [Ingress Secret](docs/secret.md#ingress-secret)

Create the Secret:

```bash
kubectl apply -f ingress/secret.yml
```

### Deploy Ingress

```bash
kubectl apply -f ingress/ingress.yml
```

---

## Test

### /etc/hosts

```bash
127.0.0.1 example.localhost
```

### Open a browser

Go to: [http://example.localhost](http://example.localhost)

It is automatically redirected to HTTPS.

---

## Check

### Object List

```bash
kubectl get deploy # deployments, deployment
kubectl get svc    # services, service
kubectl get ep     # endpoints, 
kubectl get rs     # replicasets, replicaset
kubectl get po     # pods
kubectl get ing    # ingress
```

### Network

```bash
curl -X GET backend-service:80;
curl -X GET backend-service.default:80;
curl -X GET backend-service.default.svc:80;
curl -X GET backend-service.default.svc.cluster.local:80;
```

---

## Destroy Kube application

### Ingress

```bash
kubectl delete -f ingress.yml
```

#### Secret

```bash
kubectl delete -f ingress/secret.yml
```

### Backend

```bash
kubectl delete -f backend/deploy.yml;
kubectl delete -f backend/proxy/configmap.yml;
```
