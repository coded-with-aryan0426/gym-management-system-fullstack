package com.gym.management.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "PROGRESS_NOTES")
public class ProgressNote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trainer_id")
    private User trainer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id")
    private User member;

    @Lob
    @Column(name = "NOTE")
    private String note; // Legacy, maps to content

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    // New Fields matching V13 migration
    @Column(name = "session_date")
    private java.time.LocalDate sessionDate;

    @Column(name = "session_time")
    private java.time.LocalTime sessionTime;

    @Column(name = "session_type")
    private String sessionType;

    @Column(name = "category")
    private String category;

    @Column(name = "mood")
    private String mood;

    @Column(name = "highlights_json", columnDefinition = "CLOB")
    private String highlightsJson;

    @Column(name = "concerns_json", columnDefinition = "CLOB")
    private String concernsJson;

    @Column(name = "goals_json", columnDefinition = "CLOB")
    private String goalsJson;

    @Column(name = "stats_json", columnDefinition = "CLOB")
    private String statsJson;

    @Column(name = "attachments_json", columnDefinition = "CLOB")
    private String attachmentsJson;

    @Column(name = "tags_json", columnDefinition = "CLOB")
    private String tagsJson;

    @Column(name = "follow_up", columnDefinition = "CLOB")
    private String followUp;

    @Column(name = "is_private")
    private boolean isPrivate;

    // Constructors
    public ProgressNote() {
    }

    public ProgressNote(User trainer, User member, String note) {
        this.trainer = trainer;
        this.member = member;
        this.note = note;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getTrainer() {
        return trainer;
    }

    public void setTrainer(User trainer) {
        this.trainer = trainer;
    }

    public User getMember() {
        return member;
    }

    public void setMember(User member) {
        this.member = member;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public java.time.LocalDate getSessionDate() {
        return sessionDate;
    }

    public void setSessionDate(java.time.LocalDate sessionDate) {
        this.sessionDate = sessionDate;
    }

    public java.time.LocalTime getSessionTime() {
        return sessionTime;
    }

    public void setSessionTime(java.time.LocalTime sessionTime) {
        this.sessionTime = sessionTime;
    }

    public String getSessionType() {
        return sessionType;
    }

    public void setSessionType(String sessionType) {
        this.sessionType = sessionType;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getMood() {
        return mood;
    }

    public void setMood(String mood) {
        this.mood = mood;
    }

    public String getHighlightsJson() {
        return highlightsJson;
    }

    public void setHighlightsJson(String highlightsJson) {
        this.highlightsJson = highlightsJson;
    }

    public String getConcernsJson() {
        return concernsJson;
    }

    public void setConcernsJson(String concernsJson) {
        this.concernsJson = concernsJson;
    }

    public String getGoalsJson() {
        return goalsJson;
    }

    public void setGoalsJson(String goalsJson) {
        this.goalsJson = goalsJson;
    }

    public String getStatsJson() {
        return statsJson;
    }

    public void setStatsJson(String statsJson) {
        this.statsJson = statsJson;
    }

    public String getAttachmentsJson() {
        return attachmentsJson;
    }

    public void setAttachmentsJson(String attachmentsJson) {
        this.attachmentsJson = attachmentsJson;
    }

    public String getTagsJson() {
        return tagsJson;
    }

    public void setTagsJson(String tagsJson) {
        this.tagsJson = tagsJson;
    }

    public String getFollowUp() {
        return followUp;
    }

    public void setFollowUp(String followUp) {
        this.followUp = followUp;
    }

    public boolean isPrivate() {
        return isPrivate;
    }

    public void setPrivate(boolean aPrivate) {
        isPrivate = aPrivate;
    }
}
