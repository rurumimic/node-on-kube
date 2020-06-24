# Node on Kube

1. backend
   - app: node.js
   - (reverse) proxy: nginx
1. destroy k8s applications

---

## backend

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

### Open a browser

Go to: [localhost](//localhost)

---

## Check

### Object List

```bash
kubectl get deploy # deployments, deployment
kubectl get svc    # services, service
kubectl get ep     # endpoints, 
kubectl get rs     # replicasets, replicaset
kubectl get po     # pods
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

### Backend

```bash
kubectl delete -f backend/proxy/configmap.yml;
kubectl delete -f backend/deploy.yml;
```
