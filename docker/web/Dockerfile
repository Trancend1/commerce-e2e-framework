# Vendored from upstream practice-software-testing@2.3 (_docker/web.docker + vhost.conf).
# Upstream's prebuilt web image is arm64-only, so we build this tiny nginx image ourselves.
FROM nginx:1.23.3-alpine

ADD vhost.conf /etc/nginx/conf.d/default.conf
