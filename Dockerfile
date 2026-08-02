FROM node:20-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:20-slim AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

FROM node:20-slim AS runtime
WORKDIR /app

RUN groupadd --system evolve && useradd --system --gid evolve --create-home evolve

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3100 \
    HOSTNAME=0.0.0.0

COPY --from=build --chown=evolve:evolve /app/.next/standalone ./
COPY --from=build --chown=evolve:evolve /app/.next/static ./.next/static
COPY --from=build --chown=evolve:evolve /app/public ./public

USER evolve
EXPOSE 3100

CMD ["node", "server.js"]
