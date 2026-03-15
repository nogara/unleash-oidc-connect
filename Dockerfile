FROM node:20-alpine

ARG UNLEASH_VERSION=latest

WORKDIR /unleash
RUN npm install unleash-server@${UNLEASH_VERSION} passport passport-openidconnect

EXPOSE 4242
USER node
CMD ["node", "index.js"]
