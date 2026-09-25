FROM node:20-alpine

WORKDIR /app

COPY package*.json tsconfig.json ./
RUN npm ci

COPY src ./src

EXPOSE 3002

CMD ["npx", "tsx", "src/index.ts"]
