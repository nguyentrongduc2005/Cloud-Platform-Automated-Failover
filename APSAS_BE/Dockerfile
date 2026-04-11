# ==========================================
# BƯỚC 1: BUILD MÃ NGUỒN (Builder Stage)
# ==========================================
# Đã đổi từ JDK 17 sang JDK 21
FROM maven:3.9.6-eclipse-temurin-21-alpine AS builder

WORKDIR /app

# Copy pom.xml và tải dependencies trước để tận dụng cache
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy toàn bộ source code vào và build
COPY src ./src
RUN mvn clean package -DskipTests

# ==========================================
# BƯỚC 2: CHẠY ỨNG DỤNG (Production Stage)
# ==========================================
# Đã đổi từ JRE 17 sang JRE 21
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Best Practice: Tạo non-root user
RUN addgroup -S springgroup && adduser -S springuser -G springgroup
USER springuser:springgroup
# Copy file .jar đã build sang
COPY --from=builder /app/target/*.jar app.jar

# Mở port
EXPOSE 8080

# Chạy ứng dụng
ENTRYPOINT ["java", "-jar", "app.jar"]