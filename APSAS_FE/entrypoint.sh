#!/bin/sh

# File: entrypoint.sh
# Script này sẽ lấy biến $VITE_API_BASE từ lệnh 'docker run' 
# và ghi đè nó vào file env-config.js trước khi Nginx chạy.

echo "window.__ENV__ = {" > /usr/share/nginx/html/env-config.js
echo "  VITE_API_BASE: \"$VITE_API_BASE\"" >> /usr/share/nginx/html/env-config.js
echo "};" >> /usr/share/nginx/html/env-config.js

# Khởi động Nginx
exec "$@"