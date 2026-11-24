FROM node:22-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
RUN npm run no-existe
COPY server.js ./
COPY public/ ./public/
USER node
EXPOSE 3000
CMD ["node", "server.js"]
