FROM node:20-alpine

WORKDIR /app

# Instalar OpenSSL (requerido por Prisma en Alpine)
RUN apk add --no-cache openssl

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

# El comando sincroniza la BD y levanta el servidor de desarrollo
CMD ["sh", "-c", "npx prisma db push && npm run dev"]
