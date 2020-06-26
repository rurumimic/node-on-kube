# Secret

## Ingress Secret

Generate a self-signed certificate and private key with:

```bash
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
-keyout ingress/certs/ingress.key \
-out ingress/certs/ingress.crt \
-subj "/CN=example.localhost/O=example.localhost"
```

Write a secret object:

```bash
cat <<EOF > ingress/secret.yml
apiVersion: v1
kind: Secret
metadata:
  name: ingress-secret
type: kubernetes.io/tls
data:
  tls.crt: $(cat ingress/certs/ingress.crt | base64)
  tls.key: $(cat ingress/certs/ingress.key | base64)
EOF
```

Create the Secret:

```bash
kubectl apply -f ingress/secret.yml
```
