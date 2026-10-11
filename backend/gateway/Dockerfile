FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY apps/gateway/package*.json ./apps/gateway/
COPY packages/types/package*.json ./packages/types/

RUN npm install

COPY packages/types ./packages/types
RUN npm run build --workspace=packages/types

COPY apps/gateway ./apps/gateway
RUN npm run build --workspace=apps/gateway

EXPOSE 4000

CMD ["npm", "run", "start", "--workspace=apps/gateway"]
