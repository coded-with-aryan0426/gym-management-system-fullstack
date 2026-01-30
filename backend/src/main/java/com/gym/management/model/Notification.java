package com.gym.management.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "NOTIFICATIONS")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private User user;

    @Column(length = 255)
    private String title;

    @Lob
    @Column(name = "MESSAGE")
    private String message;

    @Column(length = 50)
    private String type; // BOOKING, SCHEDULE, MEMBERSHIP, ANNOUNCEMENT

    @Column(length = 20)
    private String priority = "normal"; // urgent, high, normal, low

    @Column(name = "is_starred")
    private Boolean isStarred = false;

    @Column(name = "is_archived")
    private Boolean isArchived = false;

    @Lob
    @Column(name = "meta_data")
    private String metaData; // JSON string for flexible data

    @Column(length = 255)
    private String link;

    @Column(name = "sender_id")
    private Long senderId; // ID of the user who sent the notification (if any)

    @Lob
    @Column(name = "action_data")
    private String actionData; // JSON string for action buttons

    @Column(name = "is_read")
    private Boolean isRead = false;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    // Constructors
    public Notification() {
    }

    public Notification(User user, String title, String message, String type, String priority) {
        this.user = user;
        this.title = title;
        this.message = message;
        this.type = type;
        this.priority = priority != null ? priority : "normal";
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
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

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Boolean getIsRead() {
        return isRead;
    }

    public void setIsRead(Boolean isRead) {
        this.isRead = isRead;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public Boolean getIsStarred() {
        return isStarred;
    }

    public void setIsStarred(Boolean isStarred) {
        this.isStarred = isStarred;
    }

    public Boolean getIsArchived() {
        return isArchived;
    }

    public void setIsArchived(Boolean isArchived) {
        this.isArchived = isArchived;
    }

    public String getMetaData() {
        return metaData;
    }

    public void setMetaData(String metaData) {
        this.metaData = metaData;
    }

    public String getLink() {
        return link;
    }

    public void setLink(String link) {
        this.link = link;
    }

    public Long getSenderId() {
        return senderId;
    }

    public void setSenderId(Long senderId) {
        this.senderId = senderId;
    }

    public String getActionData() {
        return actionData;
    }

    public void setActionData(String actionData) {
        this.actionData = actionData;
    }
}
