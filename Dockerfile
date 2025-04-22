FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./

RUN npm install
RUN npm install -g ts-node typescript

COPY . .

RUN npm run build

EXPOSE 3001

CMD ["ts-node", "src/server.ts"] 