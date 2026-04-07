package com.sadarbazar.aop;

import com.sadarbazar.entity.AuditLog;
import com.sadarbazar.repository.AuditLogRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Intercepts all mutating admin requests (POST, PUT, DELETE) and persists
 * them to the audit_logs table asynchronously.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class AdminAuditInterceptor implements HandlerInterceptor {

    private final AuditLogRepository auditLogRepository;

    private static final Pattern ENTITY_PATTERN = Pattern.compile("/admin/([a-z-]+)(?:/([^/]+))?");

    @Override
    public boolean preHandle(HttpServletRequest request, jakarta.servlet.http.HttpServletResponse response, Object handler) {
        String method = request.getMethod();

        // Only audit mutating operations
        if (!"POST".equals(method) && !"PUT".equals(method) && !"DELETE".equals(method)) {
            return true;
        }

        String uri = request.getRequestURI();
        if (!uri.contains("/admin/")) {
            return true;
        }

        String adminEmail = "unknown";
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
            adminEmail = auth.getName();
        }

        // Parse entity type and ID from URI
        String entityType = "UNKNOWN";
        String entityId = null;
        Matcher matcher = ENTITY_PATTERN.matcher(uri);
        if (matcher.find()) {
            entityType = matcher.group(1).toUpperCase().replace("-", "_");
            entityId = matcher.group(2);
        }

        String ipAddress = request.getRemoteAddr();
        String xForwarded = request.getHeader("X-Forwarded-For");
        if (xForwarded != null && !xForwarded.isEmpty()) {
            ipAddress = xForwarded.split(",")[0].trim();
        }

        saveAuditLog(adminEmail, method, entityType, entityId, uri, ipAddress);

        return true;
    }

    @Async
    void saveAuditLog(String adminEmail, String action, String entityType, String entityId, String requestUri, String ipAddress) {
        try {
            auditLogRepository.save(AuditLog.builder()
                    .adminEmail(adminEmail)
                    .action(action)
                    .entityType(entityType)
                    .entityId(entityId)
                    .requestUri(requestUri)
                    .ipAddress(ipAddress)
                    .build());
        } catch (Exception e) {
            log.error("Failed to save audit log", e);
        }
    }
}
