package com.gym.management;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@SpringBootApplication
@org.springframework.scheduling.annotation.EnableScheduling
public class GymManagementApplication extends SpringBootServletInitializer {

	private static final Logger logger = LoggerFactory.getLogger(GymManagementApplication.class);

	/**
	 * Configure the application for WAR deployment to external Tomcat server.
	 */
	@Override
	protected SpringApplicationBuilder configure(SpringApplicationBuilder builder) {
		return builder.sources(GymManagementApplication.class);
	}

	public static void main(String[] args) {
		// Log environment checks BEFORE Spring context starts to catch early failures
		logPreStartupChecks();
		SpringApplication.run(GymManagementApplication.class, args);
	}

	private static void logPreStartupChecks() {
		System.out.println("==================================================================================");
		System.out.println("  GymManagementApplication Pre-Startup Check");
		System.out.println("==================================================================================");

		String dbUrl = System.getenv("SPRING_DATASOURCE_URL");
		System.out.println("Env SPRING_DATASOURCE_URL: " + ((dbUrl != null && !dbUrl.isEmpty()) ? "[PRESENT]" : "[MISSING]"));
		if (dbUrl != null && !dbUrl.isEmpty()) {
			// Masked URL logging for safety
			String maskedUrl = dbUrl.length() > 20 ? dbUrl.substring(0, 15) + "..." : "[HIDDEN]";
			System.out.println("Env SPRING_DATASOURCE_URL (Masked): " + maskedUrl);
		}

		String dbUser = System.getenv("SPRING_DATASOURCE_USERNAME");
		System.out.println("Env SPRING_DATASOURCE_USERNAME: " + ((dbUser != null && !dbUser.isEmpty()) ? dbUser : "[MISSING]"));

		String dbPass = System.getenv("SPRING_DATASOURCE_PASSWORD");
		System.out.println("Env SPRING_DATASOURCE_PASSWORD: " + ((dbPass != null && !dbPass.isEmpty()) ? "[PRESENT]" : "[MISSING]"));

		String activeProfiles = System.getenv("SPRING_PROFILES_ACTIVE");
		System.out.println("Env SPRING_PROFILES_ACTIVE: " + (activeProfiles != null ? activeProfiles : "[DEFAULT]"));

		System.out.println("==================================================================================");
	}

}
