package com.gym.management;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import jakarta.annotation.PostConstruct;
import org.springframework.core.env.Environment;
import org.springframework.beans.factory.annotation.Autowired;

@SpringBootApplication
@org.springframework.scheduling.annotation.EnableScheduling
public class GymManagementApplication extends SpringBootServletInitializer {

	private static final Logger logger = LoggerFactory.getLogger(GymManagementApplication.class);

	@Autowired
	private Environment env;

	/**
	 * Configure the application for WAR deployment to external Tomcat server.
	 */
	@Override
	protected SpringApplicationBuilder configure(SpringApplicationBuilder builder) {
		return builder.sources(GymManagementApplication.class);
	}

	public static void main(String[] args) {
		SpringApplication.run(GymManagementApplication.class, args);
	}

	@PostConstruct
	public void logEnvVars() {
		logger.info("==================================================================================");
		logger.info("  GymManagementApplication Startup Check");
		logger.info("==================================================================================");

		String[] activeProfiles = env.getActiveProfiles();
		logger.info("Active Profiles: {}", String.join(", ", activeProfiles));

		String dbUrl = env.getProperty("spring.datasource.url");
		logger.info("Database URL: {}", (dbUrl != null && !dbUrl.isEmpty()) ? dbUrl : "[MISSING]");

		String dbUser = env.getProperty("spring.datasource.username");
		logger.info("Database User: {}", (dbUser != null && !dbUser.isEmpty()) ? dbUser : "[MISSING]");

		String port = env.getProperty("server.port");
		logger.info("Server Port: {}", port);

		if (dbUrl == null || dbUrl.isEmpty() || dbUrl.contains("${")) {
			logger.error("CRITICAL: spring.datasource.url is missing or not resolved! Check your environment variables.");
		}

		logger.info("==================================================================================");
	}

}
