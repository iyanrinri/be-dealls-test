# Stage 1: Build (hanya untuk production)
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

# Stage 2: Run (untuk dev dan prod)
FROM node:20-alpine

WORKDIR /usr/src/app

# Pasang global Nest CLI untuk development (optional, bisa di-skip kalau cuma prod)
RUN npm install -g @nestjs/cli

# Copy dependencies (prod)
COPY package*.json ./
RUN npm install --production

# Copy source kode untuk dev, atau hasil build untuk prod
ARG NODE_ENV=development
COPY --from=builder /usr/src/app/dist ./dist
COPY . .

# Port yang akan expose
EXPOSE 3000

# Command dinamis sesuai env
CMD ["sh", "-c", "if [ \"$NODE_ENV\" = \"production\" ]; then npm run start:prod; else npm run start:dev; fi"]

