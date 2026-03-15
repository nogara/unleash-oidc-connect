FROM node:20-alpine
WORKDIR /unleash
RUN npm install unleash-server passport passport-openidconnect
EXPOSE 4242
USER node
CMD ["node", "index.js"]
