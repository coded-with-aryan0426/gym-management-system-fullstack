package com.gym.management;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer;

@SpringBootApplication
@org.springframework.scheduling.annotation.EnableScheduling
public class GymManagementApplication extends SpringBootServletInitializer {

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

}
