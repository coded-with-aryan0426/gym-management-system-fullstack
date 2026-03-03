package com.gym.management.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
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

            if (StringUtils.hasText(jwt) && tokenProvider.validateToken(jwt)) {
                Long userId = tokenProvider.getUserIdFromJWT(jwt);
                // Context and GymId available if needed for custom auth object
                // String context = tokenProvider.getContextFromJWT(jwt);
                // Long gymId = tokenProvider.getGymIdFromJWT(jwt);

                UserDetails userDetails = customUserDetailsService.loadUserById(userId);

                // Augment authorities with JWT claims (Context-aware security)
                java.util.List<org.springframework.security.core.GrantedAuthority> authorities = new java.util.ArrayList<>(
                        userDetails.getAuthorities());

                String staffRole = tokenProvider.getStaffRoleFromJWT(jwt);
                String jwtContext = tokenProvider.getContextFromJWT(jwt);
                logger.info("JWT Validation: User=" + userDetails.getUsername() + ", StaffRole=" + staffRole + ", Context=" + jwtContext);

                // Add staffRole authority (TRAINER, OWNER, etc.) for STAFF context users
                if (StringUtils.hasText(staffRole)) {
                    String roleAuth = "ROLE_" + staffRole.toUpperCase();
                    boolean hasRole = authorities.stream().anyMatch(a -> a.getAuthority().equals(roleAuth));
                    if (!hasRole) {
                        logger.info("Adding authority from JWT: " + roleAuth);
                        authorities.add(new org.springframework.security.core.authority.SimpleGrantedAuthority(roleAuth));
                    }
                }

                // Add ROLE_MEMBER and ROLE_CUSTOMER for MEMBER context users
                if ("MEMBER".equalsIgnoreCase(jwtContext)) {
                    for (String r : new String[]{"ROLE_MEMBER", "ROLE_CUSTOMER"}) {
                        boolean has = authorities.stream().anyMatch(a -> a.getAuthority().equals(r));
                        if (!has) {
                            logger.info("Adding member authority from JWT context: " + r);
                            authorities.add(new org.springframework.security.core.authority.SimpleGrantedAuthority(r));
                        }
                    }
                }

                logger.info("Final Authorities: " + authorities);

                // For now, standard UsernamePasswordAuthenticationToken is fine
                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                        userDetails, null, authorities);

                // We can add the gym context to the details
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } catch (Exception ex) {
            logger.error("Could not set user authentication in security context", ex);
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
