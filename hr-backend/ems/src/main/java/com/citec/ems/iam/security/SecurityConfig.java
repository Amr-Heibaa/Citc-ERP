package com.citec.ems.iam.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            AccessTokenAuthenticationFilter accessTokenAuthenticationFilter) throws Exception {
        return http
                .csrf(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/hr/**")
                        .hasAnyAuthority(
                                "ROLE_SUPER_ADMIN",
                                "ROLE_HR_MANAGER",
                                "PERMISSION_EMPLOYEE_VIEW",
                                "PERMISSION_ORG_STRUCTURE_MANAGE",
                                "PERMISSION_POSITION_MANAGE")
                        .requestMatchers("/api/hr/**")
                        .hasAnyAuthority(
                                "ROLE_SUPER_ADMIN",
                                "ROLE_HR_MANAGER",
                                "PERMISSION_EMPLOYEE_EDIT",
                                "PERMISSION_ORG_STRUCTURE_MANAGE",
                                "PERMISSION_POSITION_MANAGE")
                        .requestMatchers("/api/iam/**")
                        .hasAnyAuthority(
                                "ROLE_SUPER_ADMIN",
                                "PERMISSION_USER_MANAGE",
                                "PERMISSION_ROLE_MANAGE")
                        .anyRequest().authenticated())
                .addFilterBefore(accessTokenAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    UserDetailsService userDetailsService() {
        return username -> {
            throw new UsernameNotFoundException(username);
        };
    }
}



