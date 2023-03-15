FROM node:22-bookworm-slim

# Own the working directory as the unprivileged user that ships with the image, so the install and
# the server both run without root.
RUN mkdir -p /app && chown node:node /app
WORKDIR /app
USER node

# Copy the manifests first so the install layer stays cached across source-only changes.
COPY --chown=node:node package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY --chown=node:node . .

EXPOSE 4000

CMD [ "yarn", "start" ]
