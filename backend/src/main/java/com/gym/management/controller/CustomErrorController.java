package com.gym.management.controller;

import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * Global Error Controller for SPA Support
 * 
 * Instead of mapping specific routes, this controller catches all 404 errors
 * and forwards them to index.html. This allows React Router to handle
 * client-side routing for any path.
 */
@Controller
public class CustomErrorController implements ErrorController {

    private static final String PATH = "/error";

    @RequestMapping(PATH)
    public String handleError() {
        // Forward to index.html for client-side routing
        // This handles refresh on existing routes like /login, /members, etc.
        return "forward:/index.html";
    }
}
