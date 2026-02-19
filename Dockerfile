# ── Stage 1: Build ──────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

COPY . .
RUN npm run build


# ── Stage 2: Serve ──────────────────────────────────────────────────────────
FROM nginx:1.27-alpine

# Remove the default nginx site config
RUN rm /etc/nginx/conf.d/default.conf

# Copy the config template
COPY nginx.conf.template /etc/nginx/templates/app.conf.template

# Copy the built React app
COPY --from=builder /app/dist /usr/share/nginx/html

# Backend URL — override at runtime via:
#   docker run -e BACKEND_URL=http://my-backend:8081 ...
ENV BACKEND_URL=http://localhost:8081

EXPOSE 3002

# Use envsubst to substitute only ${BACKEND_URL}, leaving nginx $variables intact,
# then start nginx in the foreground.
CMD ["/bin/sh", "-c", \
  "envsubst '${BACKEND_URL}' \
     < /etc/nginx/templates/app.conf.template \
     > /etc/nginx/conf.d/default.conf \
   && nginx -g 'daemon off;'"]
