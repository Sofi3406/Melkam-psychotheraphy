FROM node:18-slim

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npx prisma generate


RUN npm install -g ts-node typescript

EXPOSE 3000

CMD ["npm", "run", "dev"]
