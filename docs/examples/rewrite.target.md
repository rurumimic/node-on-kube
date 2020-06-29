# rewrite target

- `example.localhost/one/users` → `example.localhost/users`
- `example.localhost/two/users` → `example.localhost/users`

## ingress

```yml
apiVersion: networking.k8s.io/v1beta1
kind: Ingress
metadata:
  name: ingress-services
  annotations:
    kubernetes.io/ingress.class: "nginx"
    nginx.ingress.kubernetes.io/rewrite-target: /$2
spec:
  tls:
  - hosts:
    - example.localhost
    secretName: ingress-secret
  rules:
  - host: example.localhost
    http:
      paths:
      - path: /one(/|$)(.*)
        backend:
          serviceName: backend-service
          servicePort: 80
  - host: example.localhost
    http:
      paths:
      - path: /two(/|$)(.*)
        backend:
          serviceName: backend-service2
          servicePort: 80
```

## deploy

```yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend-deploy
  labels:
    name: backend
spec:
  replicas: 1
  selector:
    matchLabels:
      app: backend # == pod template: labels
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
        - name: app
          image: node-app
          imagePullPolicy: Never
          ports:
          - containerPort: 3000
        - name: proxy
          image: nginx:alpine
          ports:
          - containerPort: 80
          volumeMounts:
            - name: nginx-conf-file
              mountPath: /etc/nginx/nginx.conf
              subPath: nginx.conf
              readOnly: true
            - name: default-conf-file
              mountPath: /etc/nginx/templates/default.conf.template
              subPath: default.conf.template
              readOnly: true
      volumes:
        - name: nginx-conf-file
          configMap:
            name: nginx-conf
        - name: default-conf-file
          configMap:
            name: default-conf
---
apiVersion: v1
kind: Service
metadata:
  name: backend-service
spec:
  type: ClusterIP # or NodePort
  selector:
    app: backend # == pod template: labels
  ports:
    - protocol: TCP
      name: http
      port: 80
      targetPort: 80 # == pod template: spec ports container port
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend-deploy2
  labels:
    name: backend2
spec:
  replicas: 1
  selector:
    matchLabels:
      app: backend2 # == pod template: labels
  template:
    metadata:
      labels:
        app: backend2
    spec:
      containers:
        - name: app
          image: node-app
          imagePullPolicy: Never
          ports:
          - containerPort: 3000
        - name: proxy
          image: nginx:alpine
          ports:
          - containerPort: 80
          volumeMounts:
            - name: nginx-conf-file
              mountPath: /etc/nginx/nginx.conf
              subPath: nginx.conf
              readOnly: true
            - name: default-conf-file
              mountPath: /etc/nginx/templates/default.conf.template
              subPath: default.conf.template
              readOnly: true
      volumes:
        - name: nginx-conf-file
          configMap:
            name: nginx-conf
        - name: default-conf-file
          configMap:
            name: default-conf
---
apiVersion: v1
kind: Service
metadata:
  name: backend-service2
spec:
  type: ClusterIP # or NodePort
  selector:
    app: backend2 # == pod template: labels
  ports:
    - protocol: TCP
      name: http
      port: 80
      targetPort: 80 # == pod template: spec ports container port
```