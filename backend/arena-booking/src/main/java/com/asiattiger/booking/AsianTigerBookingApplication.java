package com.asiattiger.booking;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class AsianTigerBookingApplication {

    public static void main(String[] args) {
        SpringApplication.run(AsianTigerBookingApplication.class, args);
        System.out.println("🏅 Asian Tiger Arena Booking System Started Successfully!");
        System.out.println("📊 API Documentation: http://localhost:8080/swagger-ui.html");
        System.out.println("🔥 Backend Server: http://localhost:8080/api");
        System.out.println("🗄️ H2 Database Console: http://localhost:8080/h2-console");
        System.out.println("📋 Health Check: http://localhost:8080/actuator/health");
    }
}