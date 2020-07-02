# Init Containers

1. Make a empty volume: `init`
1. Run init containers: `install`
   1. Mount a volume to a directory: `init` Volume → `/init`
   1. Save files in a directory: `wget -O /init/FILE LINK`
1. Run containers: `proxy`
   1. Mount a volume to a directroy: `init` Volume → `/usr/share/nginx/html/init`
1. Use files in container: `default.conf` - `/usr/share/nginx/html/init/bauhaus.html`

## Deployment

```yml
# apiVersion, kind, metadata
spec:
  # replicas, selector, template
  spec:
    volumes:
      - name: init # 1. make a empty volume
        emptyDir: {}
    initContainers: # 2. run init containers
    - name: install
      image: rurumimic/wget
      command: # 2-2. save a file
      - wget
      - --no-check-certificate
      - -k # --convert-links
      - -O # --output-document=FILE
      - /init/bauhaus.html
      - https://en.wikipedia.org/wiki/Bauhaus
      volumeMounts: # 2-1. mount a volume
      - name: init
        mountPath: /init
    containers: # 3. run containers
      - name: proxy
        image: nginx:alpine
        ports:
        - containerPort: 80
        volumeMounts: # 3-1. mount a volume
          - name: init
            mountPath: /usr/share/nginx/html/init
            readOnly: true
```

## nginx configurations

`default.conf`

```nginx
server {
  location /wiki {
      alias /usr/share/nginx/html/init; # 4. use files in container
      index bauhaus.html;
  }
}
```

## Test

1. Open [http://example.localhost/wiki/bauhaus.html](http://example.localhost/wiki/bauhaus.html).
1. Compare with [Wikipedia: Bauhaus](https://en.wikipedia.org/wiki/Bauhaus).