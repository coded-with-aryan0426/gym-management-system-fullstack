package com.gym.management.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "ALERTS")
public class Alert {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "alert_seq")
    @SequenceGenerator(name = "alert_seq", sequenceName = "ALERT_SEQ", allocationSize = 1)
    @Column(name = "ALERT_ID")
    private Long alertId;

    @Column(name = "TYPE")
    private String type; // "Equipment", "Staff", "Inventory", "System"

    @Column(name = "TITLE")
    private String title;

    @Column(name = "MESSAGE", length = 500)
    private String message;

    @Column(name = "SEVERITY")
    private String severity; // "info", "warning", "danger"

    @Column(name = "CREATED_AT", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "IS_READ")
    private Boolean isRead;

    // Constructors
    public Alert() {
        this.createdAt = LocalDateTime.now();
        this.isRead = false;
        this.severity = "info";
    }

    public Alert(String type, String title, String message, String severity) {
        this.type = type;
        this.title = title;
        this.message = message;
        this.severity = severity;
        this.createdAt = LocalDateTime.now();
        this.isRead = false;
    }

    // Getters and Setters
    public Long getAlertId() {
        return alertId;
    }

    public void setAlertId(Long alertId) {
        this.alertId = alertId;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getSeverity() {
        return severity;
    }

    public void setSeverity(String severity) {
        this.severity = severity;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public Boolean getIsRead() {
        return isRead;
    }

    public void setIsRead(Boolean isRead) {
        this.isRead = isRead;
    }

    public void markAsRead() {
        this.isRead = true;
    }
}
