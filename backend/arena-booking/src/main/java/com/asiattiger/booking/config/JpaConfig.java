package com.asiattiger.booking.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.transaction.annotation.EnableTransactionManagement;

@Configuration
@EnableJpaRepositories(basePackages = "com.asiattiger.booking.repository")
@EnableTransactionManagement
public class JpaConfig {
    // Spring Boot auto-configuration will handle EntityManagerFactory
    // This class just ensures proper repository scanning
}