# ── Build stage ───────────────────────────────────────────────────────────────
FROM node:20-alpine AS build

# VITE_ vars are baked into the JS bundle at build time
ARG VITE_GEMINI_API_KEY
ARG VITE_GOOGLE_MAPS_API_KEY
ARG VITE_GOOGLE_CLIENT_ID

ENV VITE_GEMINI_API_KEY=$VITE_GEMINI_API_KEY
ENV VITE_GOOGLE_MAPS_API_KEY=$VITE_GOOGLE_MAPS_API_KEY
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ── Serve stage — Node/Express (API + static) ─────────────────────────────────
FROM node:20-alpine

WORKDIR /app

# Install production deps only
COPY package*.json ./
RUN npm ci --omit=dev

# Copy server and built frontend
COPY server ./server
COPY --from=build /app/dist ./dist

# The backend will pick up GEMINI_API_KEY from the environment
EXPOSE 8080
CMD ["node", "server/index.js"]
