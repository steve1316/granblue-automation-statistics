FROM node:20-bookworm-slim

WORKDIR /app
ADD . /app

# Some packages have not updated to work with OpenSSL 3.0 for Node 17+.
# So we need to specify the workaround to allow the install and build to proceed.
RUN NODE_OPTIONS=--openssl-legacy-provider yarn install
RUN NODE_OPTIONS=--openssl-legacy-provider yarn build

EXPOSE 5173

CMD [ "yarn", "start" ]