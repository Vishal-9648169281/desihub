FROM node:20-slim AS build
WORKDIR /app
COPY frontend/package.json ./
# package-lock.json is generated on Windows and doesn't record Linux-native
# optional deps (@tailwindcss/oxide, rollup) — a known npm bug (npm/cli#4828).
# Resolve fresh here instead of trusting the cross-platform lockfile.
RUN npm install
COPY frontend/ .
ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
