package com.sadarbazar.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

/**
 * Stores an audit trail of all admin actions (create, update, delete).
 */
@Entity
@Table(name = "audit_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "admin_email", nullable = false)
    private String adminEmail;

    @Column(nullable = false)
    private String action; // POST, PUT, DELETE

    @Column(name = "entity_type")
    private String entityType; // PRODUCT, ORDER, CAMPAIGN, etc.

    @Column(name = "entity_id")
    private String entityId;

    @Column(name = "request_uri", nullable = false)
    private String requestUri;

    @Column(name = "ip_address")
    private String ipAddress;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;
}
