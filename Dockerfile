FROM node:16.17.0-bullseye-slim
RUN apt-get update && apt-get install -y --no-install-recommends dumb-init
ENV NODE_ENV production
WORKDIR /usr/src/app
COPY --chown=node:node . /usr/src/app/
RUN npm ci  --only=production
USER node
EXPOSE 3306
CMD ["dumb-init", "node", "server.js"]
