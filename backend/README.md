# Backend

## Make Certificates

Create a root certificate and private key:

```bash
openssl req -x509 -sha256 -nodes -days 365 -newkey rsa:2048 -subj '/O=example Inc./CN=example.localhost' -keyout example.localhost.key -out example.localhost.crt;
```

Create a certificate and a private key for `sub.example.localhost`:

```bash
openssl req -out sub.example.localhost.csr -newkey rsa:2048 -nodes -keyout sub.example.localhost.key -subj "/CN=sub.example.localhost/O=sub organization";
openssl x509 -req -days 365 -CA example.localhost.crt -CAkey example.localhost.key -set_serial 0 -in sub.example.localhost.csr -out sub.example.localhost.crt;
```

Create a chained certificate:

```bash
cat sub.example.localhost.crt example.localhost.crt > chained.crt
```

### Result

- chained.crt
- example.localhost.crt
- example.localhost.key
- sub.example.localhost.crt
- sub.example.localhost.csr
- sub.example.localhost.key
