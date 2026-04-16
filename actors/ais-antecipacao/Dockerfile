FROM apify/actor-node:20 AS builder
COPY --chown=myuser:myuser package*.json ./
RUN npm install --include=dev --audit=false
COPY --chown=myuser:myuser . ./
RUN npm run build

FROM apify/actor-node:20
COPY --chown=myuser:myuser package*.json ./
RUN npm --quiet set progress=false && npm install --omit=dev --omit=optional && rm -r ~/.npm
COPY --from=builder --chown=myuser:myuser /home/myuser/dist ./dist
COPY --chown=myuser:myuser . ./
CMD ["node", "dist/main.js"]
