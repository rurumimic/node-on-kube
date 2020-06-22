# Node on Kube

- Kubernetes configurations: [deploy.yml](deploy.yml)

## Usage

### Build Docker Image

```bash
docker build -t express-app -f backend/Dockerfile backend
```

### Run Kube application

```bash
kubectl apply -f deploy.yml
```

### Open a browser

Go to: [localhost:3001](//localhost:3001)

### Detail

```bash
kubectl describe deploy backend-deploy
kubectl describe svc backend-service
kubectl describe ep backend-service
kubectl get rs
kubectl get po
```

### Destroy Kube application

```bash
kubectl delete -f deploy.yml
```
