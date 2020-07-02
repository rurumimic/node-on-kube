# Client Certificate Authentication: Mutual Authentication

CA Authentication also known as Mutual Authentication allows both the server and client to verify each others identity via a common CA.

- [Configuring Certificate-Based Mutual Authentication with Kubernetes Ingress-Nginx](https://medium.com/@awkwardferny/configuring-certificate-based-mutual-authentication-with-kubernetes-ingress-nginx-20e7e38fdfca)

![](https://www.codeproject.com/KB/IP/326574/mutualssl_small.png)

Mutual Authentication flow from codeproject.com: [An Introduction to Mutual SSL Authentication](https://www.codeproject.com/Articles/326574/An-Introduction-to-Mutual-SSL-Authentication)

1. [Prerequisites](https://kubernetes.github.io/ingress-nginx/examples/PREREQUISITES/)
2. [Client Certificate Authentication](https://kubernetes.github.io/ingress-nginx/examples/auth/client-certs/)

---

## Setup

### /etc/hosts

```bash
127.0.0.1 client.auth.localhost
```

---

## Create certificates

```bash
mkdir -p ingress/ingress-nginx/mutual/certs
cd ingress/ingress-nginx/mutual/certs
```

Generate the CA Key and Certificate:

```bash
openssl req -x509 -sha256 -newkey rsa:4096 -keyout ca.key -out ca.crt -days 356 -nodes -subj '/CN=My Cert Authority';
```

Generate the Server Key, and Certificate and Sign with the CA Certificate:

```bash
openssl req -new -newkey rsa:4096 -keyout server.key -out server.csr -nodes -subj '/CN=client.auth.localhost';
openssl x509 -req -sha256 -days 365 -in server.csr -CA ca.crt -CAkey ca.key -set_serial 01 -out server.crt;
```

Generate the Client Key, and Certificate and Sign with the CA Certificate:

```bash
openssl req -new -newkey rsa:4096 -keyout client.key -out client.csr -nodes -subj '/CN=My Client';
openssl x509 -req -sha256 -days 365 -in client.csr -CA ca.crt -CAkey ca.key -set_serial 02 -out client.crt;
```

---

## Creat Certificate Secrets

There are [many different ways](https://kubernetes.github.io/ingress-nginx/examples/auth/client-certs/#creating-certificate-secrets) of configuring your secrets to enable Client-Certificate Authentication to work properly.

You can create a secret containing just the CA certificate and another Secret containing the Server Certificate which is Signed by the CA:

```bash
kubectl create secret generic ca-secret --from-file=ca.crt=ca.crt;
kubectl create secret generic tls-secret --from-file=tls.crt=server.crt --from-file=tls.key=server.key;
```

---

## Ingress Object

[ingress.yml](ingress.yml)

### Create a ingress resource

In the project root directory:

```bash
kubectl apply -f ingress/ingress-nginx/mutual/ingress.yml;
```

---

## Test

### Test w/o Client Cert: 400 Bad Request

```bash
curl https://client.auth.localhost -k
```

```html
<html>
<head>
  <title>400 No required SSL certificate was sent</title>
</head>
<body>
  <center>
    <h1>400 Bad Request</h1>
  </center>
  <center>No required SSL certificate was sent</center>
  <hr>
  <center>nginx/1.19.0</center>
</body>
</html>
```

### Test w/ Client Cert: 200 OK

```bash
curl https://client.auth.localhost -k \
--cert ingress/ingress-nginx/mutual/certs/client.crt \
--key ingress/ingress-nginx/mutual/certs/client.key
```

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Express</title>
    <link rel="stylesheet" href="/stylesheets/style.css">
  </head>
  <body>
    <h1>Express</h1>
    <p>Welcome to Express</p>
  </body>
</html>
```

---

## Cleanup

### Ingress

```bash
kubectl delete -f ingress/ingress-nginx/mutual/ingress.yml
```

### Secrets

```bash
kubectl delete secret ca-secret;
kubectl delete secret tls-secret;
```
