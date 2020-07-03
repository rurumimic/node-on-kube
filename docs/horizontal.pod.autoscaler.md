# Horizontal Pod Autoscaler

[Horizontal Pod Autoscaler Walkthrough](https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale-walkthrough/)

1. Set [metrics server](https://github.com/kubernetes-sigs/metrics-server)
1. Run & expose php-apache server
1. Autoscale deployment: Create Horizontal Pod Autoscaler
   1. Increase load
   1. Stop load
1. Autoscaling on multiple metrics and custom metrics

## Set metrics server

### Configurations

- `--kubelet-preferred-address-types` - The priority of node address types used when determining an address for connecting to a particular node (default [Hostname,InternalDNS,InternalIP,ExternalDNS,ExternalIP])
- `--kubelet-insecure-tls` - Do not verify the CA of serving certificates presented by Kubelets. For testing purposes only.
- `--requestheader-client-ca-file` - Specify a root certificate bundle for verifying client certificates on incoming requests.

### Edit object

Download `components.yaml` at [metrics-server releases](https://github.com/kubernetes-sigs/metrics-server/releases):

```bash
curl -sL -o hpa/metrics.yml https://github.com/kubernetes-sigs/metrics-server/releases/download/v0.3.6/components.yaml
```

Add configurations to `Container: metrics-server` in `Deployment: metrics-server`:

```yaml
# ...
containers:
- name: metrics-server
   image: k8s.gcr.io/metrics-server-amd64:v0.3.6
   imagePullPolicy: IfNotPresent
   args:
      - --cert-dir=/tmp
      - --secure-port=4443
      - --kubelet-insecure-tls
      - --kubelet-preferred-address-types=InternalIP,ExternalIP,Hostname
      - --metric-resolution=30s # refresh rate 30 seconds
# ...
```

### Run a metrics server

```bash
kubectl apply -f hpa/metrics.yml
```

## Run & expose php-apache server

```bash
kubectl apply -f https://k8s.io/examples/application/php-apache.yaml
```

## Autoscale deployment: Create Horizontal Pod Autoscaler

Create `hpa.yml`:

```yml
apiVersion: autoscaling/v1
kind: HorizontalPodAutoscaler
metadata:
  name: php-apache
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: php-apache
  minReplicas: 1
  maxReplicas: 5
  targetCPUUtilizationPercentage: 50
```

```bash
kubectl apply -f hpa/app/hpa.yml
# or
kubectl autoscale deploy php-apache --cpu-percent=50 --min=1 --max=5
```

### Check the current status

```bash
kubectl get hpa --watch

NAME         REFERENCE               TARGETS   MINPODS   MAXPODS   REPLICAS   AGE
php-apache   Deployment/php-apache   0%/50%    1         5         1          38s
```

### Increase load

```bash
kubectl run -it --rm load-generator --image=busybox /bin/sh

Hit enter for command prompt

while true; do wget -q -O- http://php-apache; done
```

### Check the current status

```bash
kubectl get hpa --watch

NAME         REFERENCE               TARGETS    MINPODS   MAXPODS   REPLICAS   AGE
php-apache   Deployment/php-apache   0%/50%     1         5         1          38s
php-apache   Deployment/php-apache   12%/50%    1         5         1          76s
php-apache   Deployment/php-apache   247%/50%   1         5         1          91s
php-apache   Deployment/php-apache   246%/50%   1         5         4          107s
```

```bash
kubectl get deployment php-apache

NAME         READY   UP-TO-DATE   AVAILABLE   AGE
php-apache   5/5     5            5           5m
```

### Stop load

terminate the load generation by typing: `<Ctrl> + C`

Autoscaling the replicas may take a few minutes.

```bash
kubectl get hpa --watch

NAME         REFERENCE               TARGETS    MINPODS   MAXPODS   REPLICAS   AGE
php-apache   Deployment/php-apache   246%/50%   1         5         4          107s
php-apache   Deployment/php-apache   84%/50%    1         5         5          2m2s
php-apache   Deployment/php-apache   13%/50%    1         5         5          2m17s
php-apache   Deployment/php-apache   6%/50%     1         5         5          2m33s
php-apache   Deployment/php-apache   0%/50%     1         5         5          2m48s
php-apache   Deployment/php-apache   0%/50%     1         5         5          7m7s
php-apache   Deployment/php-apache   0%/50%     1         5         1          7m22s
```

```bash
kubectl get deployment php-apache

NAME         READY   UP-TO-DATE   AVAILABLE   AGE
php-apache   1/1     1            1           9m
```

---

## Autoscaling on multiple metrics and custom metrics

- [Support for multiple metrics](https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/#support-for-multiple-metrics)
  - [Implementations](https://github.com/kubernetes/metrics/blob/master/IMPLEMENTATIONS.md#custom-metrics-api)
    - [kube-metrics-adapter](https://github.com/zalando-incubator/kube-metrics-adapter)

You can introduce additional metrics to use when autoscaling the `php-apache` Deployment by making use of the `autoscaling/v2beta2` API version.

Get the YAML of the HPA:

```bash
kubectl get hpa.v2beta2.autoscaling php-apache -o yaml > hpa/app/hpa.v2.yaml
```

Edit `hpa.v2.yaml`.

```yml
spec:
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        averageUtilization: 50 
        type: Utilization
  - type: Pods
    pods:
      metric:
        name: packets-per-second
      target:
        type: AverageValue
        averageValue: 1k
  - type: Object
    object:
      metric:
        name: requests-per-second
      describedObject:
        apiVersion: networking.k8s.io/v1beta1
        kind: Ingress
        name: main-route
      target:
        type: Value
        value: 10k
status:
  currentMetrics:
  - type: Resource
    resource:
      name: cpu
      current:
        averageUtilization: 0
        averageValue: 1m
  - type: Object
    object:
      metric:
        name: requests-per-second
      describedObject:
        apiVersion: networking.k8s.io/v1beta1
        kind: Ingress
        name: main-route
      current:
        value: 10k
```

Update metrics:

```bash
kubectl apply -f hpa/app/hpa.v2.yaml
```

---

## Clean up

```bash
kubectl delete hpa php-apache
kubectl delete -f https://k8s.io/examples/application/php-apache.yaml
kubectl delete -f hpa/metrics.yml
```
