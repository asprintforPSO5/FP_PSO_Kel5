FROM node:22-slim

RUN apk update && apk upgrade # Tambahkan ini untuk Alpine Linux
WORKDIR /app

COPY package*.json ./

RUN npm ci && npm audit fix --force


COPY . .


RUN npm run build

FROM nginx:stable-alpine


COPY --from=builder /app/dist /usr/share/nginx/html


EXPOSE 80


CMD ["nginx", "-g", "daemon off;"]