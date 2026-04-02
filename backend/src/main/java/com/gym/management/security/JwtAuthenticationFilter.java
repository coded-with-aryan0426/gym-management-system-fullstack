package com.gym.management.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private CustomUserDetailsService customUserDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        try {
            String jwt = getJwtFromRequest(request);

            if (StringUtils.hasText(jwt)) {
                if (tokenProvider.validateToken(jwt)) {
                    Long userId = tokenProvider.getUserIdFromJWT(jwt);

                    UserDetails userDetails = customUserDetailsService.loadUserById(userId);

                    java.util.List<org.springframework.security.core.GrantedAuthority> authorities = new java.util.ArrayList<>(
                            userDetails.getAuthorities());

                    String staffRole = tokenProvider.getStaffRoleFromJWT(jwt);
                    String jwtContext = tokenProvider.getContextFromJWT(jwt);

                    if (StringUtils.hasText(staffRole)) {
                        String roleAuth = "ROLE_" + staffRole.toUpperCase();
                        boolean hasRole = authorities.stream().anyMatch(a -> a.getAuthority().equals(roleAuth));
                        if (!hasRole) {
                            authorities.add(new org.springframework.security.core.authority.SimpleGrantedAuthority(roleAuth));
                        }
                    }

                    if ("MEMBER".equalsIgnoreCase(jwtContext)) {
                        for (String r : new String[]{"ROLE_MEMBER", "ROLE_CUSTOMER"}) {
                            boolean has = authorities.stream().anyMatch(a -> a.getAuthority().equals(r));
                            if (!has) {
                                authorities.add(new org.springframework.security.core.authority.SimpleGrantedAuthority(r));
                            }
                        }
                    }

                    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                            userDetails, null, authorities);

                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    SecurityContextHolder.getContext().setAuthentication(authentication);
                } else {
                    logger.debug("JWT token validation failed for request to: " + request.getRequestURI());
                }
            }
        } catch (UsernameNotFoundException ex) {
            logger.warn("User not found during JWT authentication: " + ex.getMessage());
            SecurityContextHolder.clearContext();
        } catch (io.jsonwebtoken.ExpiredJwtException ex) {
            logger.warn("Expired JWT token for request to: " + request.getRequestURI());
            SecurityContextHolder.clearContext();
        } catch (io.jsonwebtoken.MalformedJwtException ex) {
            logger.warn("Malformed JWT token for request to: " + request.getRequestURI());
            SecurityContextHolder.clearContext();
        } catch (Exception ex) {
            logger.error("Could not set user authentication in security context for request to: " + request.getRequestURI(), ex);
            SecurityContextHolder.clearContext();
        }

        filterChain.doFilter(request, response);
    }

    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
