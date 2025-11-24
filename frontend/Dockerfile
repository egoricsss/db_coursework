# Stage 1: Build
FROM node:18-alpine as build

WORKDIR /app

# Копирование package files
COPY package*.json ./

# Установка зависимостей (используем install вместо ci)
RUN npm install

# Копирование исходного кода
COPY . .

# Сборка приложения
RUN npm run build

# Stage 2: Serve
FROM nginx:alpine

# Копирование собранного приложения
COPY --from=build /app/dist /usr/share/nginx/html

# Копирование nginx конфигурации
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]