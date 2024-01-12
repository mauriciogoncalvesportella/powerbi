#bin/bash
podman run -d \
        --name postgres \
        -p 5432:5432 \
        -e POSTGRES_USER=admin \
        -e POSTGRES_PASSWORD=admin \
        postgres
