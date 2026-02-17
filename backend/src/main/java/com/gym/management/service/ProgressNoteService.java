package com.gym.management.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.gym.management.dto.progress_note.ProgressNoteDTO;
import com.gym.management.model.ProgressNote;
import com.gym.management.model.User;
import com.gym.management.repository.ProgressNoteRepository;
import com.gym.management.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProgressNoteService {

    @Autowired
    private ProgressNoteRepository progressNoteRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ObjectMapper objectMapper;

    // Date formats
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("hh:mm a");

    @Transactional(readOnly = true)
    public List<ProgressNoteDTO> getAllNotesForTrainer(Long trainerId) {
        return progressNoteRepository.findByTrainerUserIdOrderByCreatedAtDesc(trainerId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProgressNoteDTO> getNotesForMember(Long memberId) {
        return progressNoteRepository.findByMemberUserIdOrderByCreatedAtDesc(memberId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProgressNoteDTO createNote(Long trainerId, ProgressNoteDTO dto) {
        userRepository.findById(trainerId)
                .orElseThrow(() -> new RuntimeException("Trainer not found"));

        // dto.getMember().getName() isn't enough to identify member.
        // We need memberId passed in DTO or URL.
        // Assuming the Controller handles getting the memberId or it's in the DTO?
        // The DTO has 'member' which is MemberInfo (name, avatar...). No ID?
        // Wait, the DTO structure in the file doesn't have memberId at root.
        // It has MemberInfo.
        // The Controller should create the note via /members/{id}/notes usually.
        // Or the DTO must be enhanced to accept memberId for creation.
        // For now, let's assume createNote receives memberId too, or we parse it.
        // Let's create a method accepting memberId.
        throw new UnsupportedOperationException("Use createNoteForMember instead");
    }

    @Transactional
    public ProgressNoteDTO createNoteForMember(Long trainerId, Long memberId, ProgressNoteDTO dto) {
        User trainer = userRepository.findById(trainerId)
                .orElseThrow(() -> new RuntimeException("Trainer not found"));
        User member = userRepository.findById(memberId)
                .orElseThrow(() -> new RuntimeException("Member not found"));

        ProgressNote note = new ProgressNote();
        note.setTrainer(trainer);
        note.setMember(member);
        updateEntityFromDTO(note, dto);

        ProgressNote savedNote = progressNoteRepository.save(note);
        return convertToDTO(savedNote);
    }

    @Transactional
    public ProgressNoteDTO updateNote(Long noteId, ProgressNoteDTO dto) {
        ProgressNote note = progressNoteRepository.findById(noteId)
                .orElseThrow(() -> new RuntimeException("Note not found"));

        updateEntityFromDTO(note, dto);
        ProgressNote savedNote = progressNoteRepository.save(note);
        return convertToDTO(savedNote);
    }

    @Transactional
    public void deleteNote(Long noteId) {
        progressNoteRepository.deleteById(noteId);
    }

    private void updateEntityFromDTO(ProgressNote note, ProgressNoteDTO dto) {
        note.setNote(dto.getContent());
        note.setCategory(dto.getCategory());
        note.setMood(dto.getMood());
        note.setFollowUp(dto.getFollowUp());
        note.setPrivate(dto.isPrivate());
        note.setSessionType(dto.getSessionType());

        // Parse Date/Time strings
        if (dto.getDate() != null && !dto.getDate().isEmpty()) {
            try {
                note.setSessionDate(LocalDate.parse(dto.getDate(), DATE_FORMATTER));
            } catch (Exception e) {
                note.setSessionDate(LocalDate.now());
            }
        } else {
            note.setSessionDate(LocalDate.now());
        }

        if (dto.getTime() != null && !dto.getTime().isEmpty()) {
            try {
                note.setSessionTime(LocalTime.parse(dto.getTime(), TIME_FORMATTER));
            } catch (Exception e) {
                // Try standard ISO if AM/PM fails, or ignore
                try {
                    note.setSessionTime(LocalTime.parse(dto.getTime()));
                } catch (Exception ex) {
                    note.setSessionTime(LocalTime.now());
                }
            }
        } else {
            note.setSessionTime(LocalTime.now());
        }

        // Serialize Lists to JSON
        note.setHighlightsJson(toJson(dto.getHighlights()));
        note.setConcernsJson(toJson(dto.getConcerns()));
        note.setGoalsJson(toJson(dto.getGoals()));
        note.setTagsJson(toJson(dto.getTags()));
        note.setStatsJson(toJson(dto.getStats()));
        note.setAttachmentsJson(toJson(dto.getAttachments()));
    }

    private ProgressNoteDTO convertToDTO(ProgressNote note) {
        ProgressNoteDTO dto = new ProgressNoteDTO();
        dto.setId(note.getId());
        dto.setContent(note.getNote());
        dto.setCategory(note.getCategory());
        dto.setMood(note.getMood());
        dto.setFollowUp(note.getFollowUp());
        dto.setPrivate(note.isPrivate());
        dto.setSessionType(note.getSessionType());

        if (note.getSessionDate() != null) {
            dto.setDate(note.getSessionDate().format(DATE_FORMATTER));
        }
        if (note.getSessionTime() != null) {
            dto.setTime(note.getSessionTime().format(TIME_FORMATTER));
        }

        // Deserialize JSON
        dto.setHighlights(fromJsonList(note.getHighlightsJson(), String.class));
        dto.setConcerns(fromJsonList(note.getConcernsJson(), String.class));
        dto.setGoals(fromJsonList(note.getGoalsJson(), String.class));
        dto.setTags(fromJsonList(note.getTagsJson(), String.class));
        dto.setStats(fromJsonStats(note.getStatsJson()));
        dto.setAttachments(fromJsonAttachments(note.getAttachmentsJson()));

        // Populate MemberInfo
        if (note.getMember() != null) {
            ProgressNoteDTO.MemberInfo info = new ProgressNoteDTO.MemberInfo();
            info.setId(note.getMember().getUserId());
            info.setName(note.getMember().getFullName());
            info.setAvatar(note.getMember().getAvatarId());
            // Goal and StartDate might need to come from Membership or other source
            // For now leaving null or setting defaults
            dto.setMember(info);
        }

        return dto;
    }

    private String toJson(Object obj) {
        try {
            return obj != null ? objectMapper.writeValueAsString(obj) : "[]";
        } catch (JsonProcessingException e) {
            return "[]";
        }
    }

    private <T> List<T> fromJsonList(String json, Class<T> clazz) {
        if (json == null || json.isEmpty())
            return new ArrayList<>();
        try {
            return objectMapper.readValue(json,
                    objectMapper.getTypeFactory().constructCollectionType(List.class, clazz));
        } catch (JsonProcessingException e) {
            return new ArrayList<>();
        }
    }

    private List<ProgressNoteDTO.Stat> fromJsonStats(String json) {
        if (json == null || json.isEmpty())
            return new ArrayList<>();
        try {
            return objectMapper.readValue(json,
                    objectMapper.getTypeFactory().constructCollectionType(List.class, ProgressNoteDTO.Stat.class));
        } catch (JsonProcessingException e) {
            return new ArrayList<>();
        }
    }

    private List<ProgressNoteDTO.Attachment> fromJsonAttachments(String json) {
        if (json == null || json.isEmpty())
            return new ArrayList<>();
        try {
            return objectMapper.readValue(json, objectMapper.getTypeFactory().constructCollectionType(List.class,
                    ProgressNoteDTO.Attachment.class));
        } catch (JsonProcessingException e) {
            return new ArrayList<>();
        }
    }
}
