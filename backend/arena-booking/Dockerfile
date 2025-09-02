# Use a lightweight OpenJDK image
FROM openjdk:17-jdk-slim

# Set working directory
WORKDIR /app

# Copy built jar into the container
COPY target/*.jar app.jar

# Expose port (Render will override with $PORT)
EXPOSE 8080

# Run the jar
ENTRYPOINT ["java","-jar","app.jar"]
