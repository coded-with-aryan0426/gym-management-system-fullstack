# Multi-stage build for optimized production image
FROM maven:3.9-eclipse-temurin-17 AS builder

# Set working directory
WORKDIR /app

# Copy pom.xml first for dependency caching
COPY pom.xml .

# Download dependencies (cached layer)
RUN mvn dependency:go-offline -B

# Copy source code
COPY src ./src

# Build the application
RUN mvn clean package -DskipTests

# Production stage
FROM eclipse-temurin:17-jre-alpine

# Install required packages
RUN apk add --no-cache curl

# Create non-root user for security
RUN addgroup -g 1001 gymapp && \
    adduser -D -s /bin/sh -u 1001 -G gymapp gymapp

# Set working directory
WORKDIR /app

# Copy JAR from builder stage
COPY --from=builder /app/target/*.jar app.jar

# Copy configuration files
COPY --from=builder /app/src/main/resources/application.properties ./config/
COPY --from=builder /app/src/main/resources/application-secure-dev.properties ./config/

# Create logs directory
RUN mkdir -p /app/logs && chown -R gymapp:gymapp /app

# Switch to non-root user
USER gymapp

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:8080/api/public/health || exit 1

# Expose port
EXPOSE 8080

# JVM optimization for containers
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -XX:+UseG1GC -XX:+UseStringDeduplication"

# Run the application
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]