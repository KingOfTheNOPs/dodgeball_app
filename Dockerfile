FROM node:22-alpine

WORKDIR /app

# Install deps first for caching
COPY dodgeball-ui/package*.json ./dodgeball-ui/
RUN cd dodgeball-ui && npm ci

# Copy the rest
COPY dodgeball-ui ./dodgeball-ui

WORKDIR /app/dodgeball-ui

EXPOSE 5173

# Vite dev server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
