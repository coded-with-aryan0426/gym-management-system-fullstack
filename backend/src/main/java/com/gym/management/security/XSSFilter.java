package com.gym.management.security;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;
import org.springframework.stereotype.Component;
import org.springframework.core.annotation.Order;
import org.springframework.core.Ordered;

import java.io.IOException;
import java.util.regex.Pattern;

/**
 * XSS (Cross-Site Scripting) filter that sanitizes request parameters.
 * Strips dangerous HTML tags and JavaScript from all input.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class XSSFilter implements Filter {

    // Patterns for XSS attack vectors
    private static final Pattern[] XSS_PATTERNS = {
            // Script tags
            Pattern.compile("<script>(.*?)</script>", Pattern.CASE_INSENSITIVE),
            Pattern.compile("src[\r\n]*=[\r\n]*\\'(.*?)\\'",
                    Pattern.CASE_INSENSITIVE | Pattern.MULTILINE | Pattern.DOTALL),
            Pattern.compile("src[\r\n]*=[\r\n]*\\\"(.*?)\\\"",
                    Pattern.CASE_INSENSITIVE | Pattern.MULTILINE | Pattern.DOTALL),
            Pattern.compile("</script>", Pattern.CASE_INSENSITIVE),
            Pattern.compile("<script(.*?)>", Pattern.CASE_INSENSITIVE | Pattern.MULTILINE | Pattern.DOTALL),
            // Event handlers
            Pattern.compile("on\\w+\\s*=", Pattern.CASE_INSENSITIVE | Pattern.MULTILINE | Pattern.DOTALL),
            // JavaScript protocol
            Pattern.compile("javascript:", Pattern.CASE_INSENSITIVE),
            // VBScript protocol
            Pattern.compile("vbscript:", Pattern.CASE_INSENSITIVE),
            // Expression/eval
            Pattern.compile("eval\\((.*?)\\)", Pattern.CASE_INSENSITIVE | Pattern.MULTILINE | Pattern.DOTALL),
            Pattern.compile("expression\\((.*?)\\)", Pattern.CASE_INSENSITIVE | Pattern.MULTILINE | Pattern.DOTALL),
    };

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        chain.doFilter(new XSSRequestWrapper((HttpServletRequest) request), response);
    }

    /**
     * Wrapper that sanitizes all parameter values
     */
    private static class XSSRequestWrapper extends HttpServletRequestWrapper {

        public XSSRequestWrapper(HttpServletRequest request) {
            super(request);
        }

        @Override
        public String[] getParameterValues(String parameter) {
            String[] values = super.getParameterValues(parameter);
            if (values == null) {
                return null;
            }

            int count = values.length;
            String[] encodedValues = new String[count];
            for (int i = 0; i < count; i++) {
                encodedValues[i] = sanitize(values[i]);
            }
            return encodedValues;
        }

        @Override
        public String getParameter(String parameter) {
            String value = super.getParameter(parameter);
            return value != null ? sanitize(value) : null;
        }

        @Override
        public String getHeader(String name) {
            String value = super.getHeader(name);
            return value != null ? sanitize(value) : null;
        }

        /**
         * Strip XSS patterns from input string
         */
        private String sanitize(String value) {
            if (value == null) {
                return null;
            }

            String sanitized = value;
            for (Pattern pattern : XSS_PATTERNS) {
                sanitized = pattern.matcher(sanitized).replaceAll("");
            }

            // Also escape basic HTML entities
            sanitized = sanitized
                    .replace("<", "&lt;")
                    .replace(">", "&gt;");

            return sanitized;
        }
    }
}
