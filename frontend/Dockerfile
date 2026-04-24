FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY tsconfig.json vite.config.ts index.html ./
COPY src ./src

ARG VITE_API_BASE_URL=http://localhost:3333
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

RUN npm run build

EXPOSE 4173

CMD ["npm", "run", "preview"]
