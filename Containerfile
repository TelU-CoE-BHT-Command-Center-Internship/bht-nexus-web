# syntax=docker/dockerfile:1

FROM node:24.18.0-slim AS deps
WORKDIR /app

COPY package.json package-lock.json .npmrc ./
RUN npm ci

FROM node:24.18.0-slim AS builder
WORKDIR /app

ENV NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM gcr.io/distroless/nodejs24-debian12:nonroot AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api
ENV API_INTERNAL_BASE_URL=http://app:3000/api

COPY --from=builder --chown=nonroot:nonroot /app/public ./public
COPY --from=builder --chown=nonroot:nonroot /app/.next/standalone ./
COPY --from=builder --chown=nonroot:nonroot /app/.next/static ./.next/static

USER nonroot

EXPOSE 3000

# No HEALTHCHECK here (see wiki/lessons.md #26) - Podman's default OCI build
# format silently ignores this instruction, the real healthcheck belongs in
# whichever compose file runs this image, not in the image itself.

CMD ["server.js"]
