FROM node:22-bookworm-slim AS builder

WORKDIR /app
ADD . /app

RUN yarn install --frozen-lockfile
RUN yarn build

# SWS defaults to 80, so we need to expose that for the compose file to work.
FROM joseluisq/static-web-server:2
COPY --from=builder /app/build /public

# Add configuration for SWS to handle SPA routing.
ENV SERVER_FALLBACK_PAGE=/public/index.html
EXPOSE 80
