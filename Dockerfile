FROM node:22.12.0-slim@sha256:a4b757cd491c7f0b57f57951f35f4e85b7e1ad54dbffca4cf9af0725e1650cd8 AS builder
COPY . .
RUN npm install
RUN npm prune
RUN npm run build
FROM node:22.12.0-slim@sha256:a4b757cd491c7f0b57f57951f35f4e85b7e1ad54dbffca4cf9af0725e1650cd8 AS runner
ENV NODE_ENV=production
WORKDIR /app
COPY --from=builder --chown=node:node dist/ /app/dist/
COPY --from=builder --chown=node:node node_modules/ /app/node_modules/
RUN apt-get update && apt-get upgrade -y && apt-get install -y --no-install-recommends dumb-init
USER node
CMD ["dumb-init", "node", "dist/src/main"]
