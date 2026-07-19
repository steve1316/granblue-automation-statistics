FROM node:20-bookworm-slim AS builder

WORKDIR /app
ADD . /app

# Some packages have not updated to work with OpenSSL 3.0 for Node 17+.
# So we need to specify the workaround to allow the install and build to proceed.
RUN NODE_OPTIONS=--openssl-legacy-provider yarn install
RUN NODE_OPTIONS=--openssl-legacy-provider yarn build

# SWS defaults to 80, so we need to expose that for the compose file to work.
FROM joseluisq/static-web-server:2
COPY --from=builder /app/build /public

# Add configuration for SWS to handle SPA routing.
ENV SERVER_FALLBACK_PAGE=/public/index.html
EXPOSE 80
