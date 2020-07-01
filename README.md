# Node on Kube

1. Setup
1. Database
   - mariadb & persistent storage
2. Backend
   - app: node.js
   - reverse proxy: nginx
3. Ingress
   - ingress controller: nginx
   - secret: certificates
   - deploy ingress
   - (option) mutual authentication
4. Test
5. Service Mesh
   - Istio
6. Destroy k8s applications
7. Tip

---

## Setup

### /etc/hosts

```bash
127.0.0.1 example.localhost
```

---

## Istio

### (First time only) Add label

```bash
kubectl label namespace default istio-injection=enabled
```

### (First time only) Install

```bash
curl -L https://istio.io/downloadIstio | sh -
cd istio-1.6.3
```

### Export PATH

```bash
export PATH=$PWD/bin:$PATH
```

### Install a profile

```bash
istioctl install --set profile=demo
```

---

## Database

### MariaDB

```bash
kubectl apply -f db/mariadb/configmap.yml;
kubectl apply -f db/mariadb/volume.yml;
kubectl apply -f db/mariadb/deploy.yml;
```

### Insert data from dump files

```bash
kubectl exec -i $(kubectl get pod --selector=app=mariadb --template '{{range .items}}{{.metadata.name}}{{end}}') -c db \
-- sh -c 'exec mysql -umaster -pmypw' < db/mariadb/data/dump.sql
```

Read [Setup MariaDB](db/mariadb/README.md)

---

## Backend

### Build Node.js Docker Image

```bash
docker build -t node-app backend/app
```

### Deploy Backend Service

```bash
kubectl apply -f backend/proxy/configmap.yml;
kubectl apply -f backend/deploy.yml;
```

---

## Ingress

### Istio Gateway

```bash
kubectl apply -f ingress/istio/gateway.yml;
istioctl analyze;
```

```bash
kubectl get svc istio-ingressgateway -n istio-system
```

```bash
export INGRESS_HOST=$(kubectl -n istio-system get service istio-ingressgateway -o jsonpath='{.status.loadBalancer.ingress[0].hostname}');
export INGRESS_PORT=$(kubectl -n istio-system get service istio-ingressgateway -o jsonpath='{.spec.ports[?(@.name=="http2")].port}');
export SECURE_INGRESS_PORT=$(kubectl -n istio-system get service istio-ingressgateway -o jsonpath='{.spec.ports[?(@.name=="https")].port}');
export GATEWAY_URL=$INGRESS_HOST:$INGRESS_PORT;
echo $GATEWAY_URL;
```

```bash
echo http://$GATEWAY_URL
```

### NGINX Ingress Controller for Kubernetes

- [kubernetes/ingress-nginx](https://github.com/kubernetes/ingress-nginx)
- [Installation Guide](https://kubernetes.github.io/ingress-nginx/deploy/#contents)

#### (First time only) Install a ingress controller

##### Docker for Mac

```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/master/deploy/static/provider/cloud/deploy.yaml
```

Using [other platforms](#install-a-ingress-controller-with-other-platforms): 
- minikube
- Helm 2

#### Verify Installation

```bash
kubectl get pods -n ingress-nginx -l app.kubernetes.io/name=ingress-nginx --watch
```

Once the ingress controller pods are running, you can cancel the command typing `Ctrl+C`.

### Basic Ingress: TLS 

#### SSL Certificate

Read [Ingress Secret](ingress/basic/README.md#ingress-secret)

Create the Secret:

```bash
kubectl apply -f ingress/basic/secret.yml
```

#### Deploy Ingress

```bash
kubectl apply -f ingress/basic/ingress.yml
```

### (Option) Auth Ingress: Client Certificate Authentication

Read [Client Certificate Authentication: Mutual Authentication](ingress/auth-client/README.md)

---

## Test

### Open a browser

Go to: [http://example.localhost](http://example.localhost)

It is automatically redirected to HTTPS.

### Init containers

Read [Init Containers](docs/init.containers.md)

1. Open [http://example.localhost/wiki](http://example.localhost/wiki).
1. Compare with [Wikipedia: Bauhaus](https://en.wikipedia.org/wiki/Bauhaus).

### Kiali

- Username: admin
- Password: admin

```bash
istioctl dashboard kiali
```

1. Left menu: Graph
1. Namespace: default

---

## Destroy Kube application

### Ingress

```bash
kubectl delete -f ingress/basic/ingress.yml;
kubectl delete -f ingress/basic/secret.yml;
```

### Backend

```bash
kubectl delete -f backend/deploy.yml;
kubectl delete -f backend/proxy/configmap.yml;
```

### MariaDB

```bash
kubectl delete -f db/mariadb/deploy.yml;
kubectl delete -f db/mariadb/volume.yml;
kubectl delete -f db/mariadb/configmap.yml;
```

### Istio profile

```bash
istioctl manifest generate --set profile=demo | kubectl delete -f -
```

---

## Destroy Ingress

### Istio

```bash
kubectl apply -f ingress/istio/gateway.yml;
```

### NGINX Ingress Controller

**Docker for Mac**

```bash
kubectl delete -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/master/deploy/static/provider/cloud/deploy.yaml
```

---

## Tip

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

## Appendix

### Ingress

#### Install a ingress controller with other platforms

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

##### Helm 2

```bash
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx/
helm install --name ingress-nginx ingress-nginx/ingress-nginx
```