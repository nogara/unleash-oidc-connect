FROM node:24-alpine

ARG UNLEASH_VERSION=latest

ENV OIDC_PROVIDER=default

WORKDIR /unleash
RUN npm install unleash-server@${UNLEASH_VERSION} passport passport-openidconnect
COPY index.js oidc-presets.js ./

EXPOSE 4242
USER node
CMD ["node", "index.js"]
