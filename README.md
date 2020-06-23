# Node on Kube

1. node.js backend
1. nginx web server
1. destroy k8s applications

---

## node.js backend

### Build Docker Image

```bash
docker build -t express-app -f backend/Dockerfile backend
```

### Run Kube application

```bash
kubectl apply -f backend/deploy.yml
```

---

## nginx web server

### Configurations

```bash
kubectl apply -f web/configmap.yml
```

### Deploy service

```bash
kubectl apply -f web/deploy.yml
```

### Open a browser

Go to: [localhost](//localhost)

---

### Detail

```bash
kubectl get deploy
kubectl get svc
kubectl get ep
kubectl get rs
kubectl get po
```

---

## Destroy Kube application

### Web

```bash
kubectl delete -f web/deploy.yml;
kubectl delete -f web/configmap.yml;
```

### Backend

```bash
kubectl delete -f backend/deploy.yml
```
