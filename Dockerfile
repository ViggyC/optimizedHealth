FROM node:16

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

#Exposes internal port inside container
EXPOSE 8080

CMD ["node", "server.js"]


