# --- BƯỚC 1: BUILD ---
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# --- BƯỚC 2: RUN NGINX ---
FROM nginx:alpine
RUN rm -rf /usr/share/nginx/html/*
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy script bơm biến vào container
COPY entrypoint.sh /entrypoint.sh
# Cấp quyền thực thi cho script
RUN chmod +x /entrypoint.sh

EXPOSE 80

# Đặt Entrypoint để chạy script trước khi chạy Nginx
ENTRYPOINT ["/entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]