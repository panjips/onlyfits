# Stage 1: Build
FROM node:24-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

ARG VITE_APP_ENV
ARG VITE_APP_URL
ARG VITE_BASE_API_URL

ENV VITE_APP_ENV=$VITE_APP_ENV \
    VITE_APP_URL=$VITE_APP_URL \
    VITE_BASE_API_URL=$VITE_BASE_API_URL

RUN npm run build

# Stage 2: Production
FROM node:24-alpine AS production

WORKDIR /app

RUN npm install -g serve

COPY --from=builder /app/dist ./dist

EXPOSE 19431

CMD ["serve", "-s", "dist", "-l", "19431"]