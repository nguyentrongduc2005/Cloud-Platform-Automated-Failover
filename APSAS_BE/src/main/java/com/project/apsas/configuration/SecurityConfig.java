package com.project.apsas.configuration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import javax.crypto.spec.SecretKeySpec;
import java.util.List;
import java.util.Objects;
import java.util.stream.Stream;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {
        @Value("${jwt.signerKey}")
        private String signerKey;

        @Value("${spring.frontend.url:}")
        private String frontendUrl;

        private final String[] PUBLIC_ENDPOINTS = {
                        "/auth/register",
                        "/auth/login",
                        "/auth/introspect",
                        "/auth/verify",
                        "/auth/refresh-token",
                        "/auth/resend-code",
                        "/oauth2/authorization/google"
        };

        private final String[] PUBLIC_ENDPOINTS_GET = {
                        "/healthz",
                        "/courses",
                        "/courses/{courseId}/register-details"
        };

        @Bean
        public SecurityFilterChain filterChain(HttpSecurity httpSecurity,
                        CustomOAuth2UserService customOAuth2UserService,
                        OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler) throws Exception {
                httpSecurity.csrf(AbstractHttpConfigurer::disable)
                                .cors(cors -> cors.configurationSource(corsConfigurationSource()));
                httpSecurity.authorizeHttpRequests(request -> request
                                .requestMatchers(HttpMethod.POST, PUBLIC_ENDPOINTS).permitAll()
                                .requestMatchers(HttpMethod.GET, PUBLIC_ENDPOINTS_GET).permitAll()
                                // .requestMatchers(HttpMethod.GET,"/users")
                                // .hasRole(Role.ADMIN.name()// .hasAuthority("ROLE_ADMIN") dung theo authority)
                                // dùng theo role đã được định nghĩa ở enum
                                // Get ra từ security placeholder cái role để phân quyền
                                .anyRequest().authenticated());
                httpSecurity.oauth2ResourceServer(
                                oauth2 -> oauth2.jwt(jwtConfigurer -> jwtConfigurer.decoder(jwtDecoder())
                                                .jwtAuthenticationConverter(jwtAuthenticationConverter())));
                httpSecurity.oauth2Login(oauth2 -> {
                        oauth2.userInfoEndpoint(userInfo -> userInfo
                                        .userService(customOAuth2UserService) // Bước 1: Find/Create user
                        );
                        oauth2.successHandler(
                                        oAuth2LoginSuccessHandler // Bước 2: Tạo token và redirect
                        );
                });
                return httpSecurity.build();
        }

        @Bean
        public CorsConfigurationSource corsConfigurationSource() {
                CorsConfiguration config = new CorsConfiguration();
                List<String> dynamicOrigins = Stream.of(frontendUrl.split(","))
                                .map(String::trim)
                                .filter(s -> !s.isEmpty())
                                .toList();

                config.setAllowedOriginPatterns(Stream.of(
                                List.of(
                                                "http://localhost",
                                                "http://localhost:*",
                                                "http://127.0.0.1",
                                                "http://127.0.0.1:*",
                                                "http://*.nip.io",
                                                "https://*.nip.io",
                                                "https://*.vercel.app"),
                                dynamicOrigins)
                                .flatMap(List::stream)
                                .filter(Objects::nonNull)
                                .distinct()
                                .toList());
                // Nếu bạn dùng cookie / Authorization header => cần dòng này
                config.setAllowCredentials(true);

                // Các method cho phép
                config.setAllowedMethods(List.of("GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"));

                // Các header cho phép
                config.setAllowedHeaders(List.of(
                                "Authorization",
                                "Content-Type",
                                "X-Requested-With",
                                "Accept",
                                "Origin"));

                // Nếu cần expose header (vd: Authorization) cho FE đọc
                config.setExposedHeaders(List.of("Authorization"));

                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
                // Áp dụng cho tất cả endpoint
                source.registerCorsConfiguration("/**", config);
                return source;
        }

        @Bean
        JwtDecoder jwtDecoder() {
                SecretKeySpec secretKeySpec = new SecretKeySpec(signerKey.getBytes(), "HS512");
                return NimbusJwtDecoder
                                .withSecretKey(secretKeySpec)
                                .macAlgorithm(MacAlgorithm.HS512)
                                .build();
        }

        @Bean
        JwtAuthenticationConverter jwtAuthenticationConverter() {
                JwtGrantedAuthoritiesConverter jwtGrantedAuthoritiesConverter = new JwtGrantedAuthoritiesConverter();
                jwtGrantedAuthoritiesConverter.setAuthorityPrefix("");

                JwtAuthenticationConverter jwtAuthenticationConverter = new JwtAuthenticationConverter();
                jwtAuthenticationConverter.setJwtGrantedAuthoritiesConverter(jwtGrantedAuthoritiesConverter);

                return jwtAuthenticationConverter;
        }

}
