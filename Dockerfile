FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/api ./api
COPY --from=builder /app/shared ./shared
COPY --from=builder /app/tsconfig.json ./

RUN mkdir -p /app/api/data

EXPOSE 3000

VOLUME ["/app/api/data"]

CMD ["node", "--import", "tsx", "api/server.ts"]
