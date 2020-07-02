# Basic TLS Ingress

## Ingress Secret

```bash
mkdir -p ingress/ingress-nginx/basic/certs
```

Generate a self-signed certificate and private key with:

```bash
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
-keyout ingress/ingress-nginx/basic/certs/ingress.key \
-out ingress/ingress-nginx/basic/certs/ingress.crt \
-subj "/CN=example.localhost/O=example.localhost"
```

Write a secret object:

```bash
cat <<EOF > ingress/ingress-nginx/basic/secret.yml
apiVersion: v1
kind: Secret
metadata:
  name: ingress-secret
type: kubernetes.io/tls
data:
  tls.crt: $(cat ingress/ingress-nginx/basic/certs/ingress.crt | base64)
  tls.key: $(cat ingress/ingress-nginx/basic/certs/ingress.key | base64)
EOF
```

Create the Secret:

```bash
kubectl apply -f ingress/ingress-nginx/basic/secret.yml
```
