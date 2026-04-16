FROM apify/actor-node:20
COPY --chown=myuser:myuser package*.json ./
RUN npm install --audit=false
COPY --chown=myuser:myuser . ./
RUN npm run build
CMD ["node", "dist/main.js"]
