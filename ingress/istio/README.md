# Secure Gateways

## Set IP and Port

Check `EXTERNAL-IP`:

```bash
kubectl get svc istio-ingressgateway -n istio-system
```

If `EXTERNAL-IP=localhost`:

```bash
export INGRESS_HOST=$(kubectl -n istio-system get service istio-ingressgateway -o jsonpath='{.status.loadBalancer.ingress[0].hostname}');
export INGRESS_PORT=$(kubectl -n istio-system get service istio-ingressgateway -o jsonpath='{.spec.ports[?(@.name=="http2")].port}');
export SECURE_INGRESS_PORT=$(kubectl -n istio-system get service istio-ingressgateway -o jsonpath='{.spec.ports[?(@.name=="https")].port}');
export TCP_INGRESS_PORT=$(kubectl -n istio-system get service istio-ingressgateway -o jsonpath='{.spec.ports[?(@.name=="tcp")].port}');
```

## Create certificates

macOS:

```bash
curl --version | grep LibreSSL

curl 7.54.0 (x86_64-apple-darwin18.0) libcurl/7.54.0 LibreSSL/2.6.5 zlib/1.2.11 nghttp2/1.24.1
```

```bash
mkdir -p ingress/istio/certs
```

Generate a self-signed certificate and private key with:

```bash
openssl req -x509 -sha256 -nodes -days 365 -newkey rsa:2048 \
-keyout ingress/istio/certs/example.localhost.key \
-out ingress/istio/certs/example.localhost.crt \
-subj '/O=example Inc./CN=example.localhost' 
```

Write a secret object:

```bash
kubectl create -n istio-system secret tls gateway-secret \
--key=ingress/istio/certs/example.localhost.key \
--cert=ingress/istio/certs/example.localhost.crt
```

Check a secret:

```bash
kubectl get secret -n istio-system

NAME              TYPE                 DATA    AGE
gateway-secret    kubernetes.io/tls    2       9s
```

## Gateway and VirtualService

```yml
apiVersion: networking.istio.io/v1alpha3
kind: Gateway
metadata:
  name: istio-gateway
spec:
  selector:
    istio: ingressgateway # use istio default controller
  servers:
  - port:
      number: 80
      name: http
      protocol: HTTP
    tls:
      httpsRedirect: true
    hosts:
    - example.localhost
  - port:
      number: 443
      name: https
      protocol: HTTPS
    tls:
      mode: SIMPLE
      credentialName: gateway-secret
    hosts:
    - example.localhost
---
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: backend
spec:
  hosts:
  - example.localhost
  gateways:
  - istio-gateway
  http:
  - route:
    - destination:
        host: backend-service
        port:
          number: 80
```

Create a gateway and virtual service:

```bash
kubectl apply -f ingress/istio/gateway.yml;
```

## Test

```bash
curl -v -HHost:example.localhost --resolve "example.localhost:80:127.0.0.1" \
--cacert ingress/istio/certs/example.localhost.crt "http://example.localhost:80"

HTTP/1.1 301 Moved Permanently
```

```bash
curl -v -HHost:example.localhost --resolve "example.localhost:443:127.0.0.1" \
--cacert ingress/istio/certs/example.localhost.crt "https://example.localhost:443"

HTTP/2 200
```

1. Open [http://example.localhost](http://example.localhost)
1. Open [https://example.localhost](https://example.localhost)
