package com.gym.management.repository;

import com.gym.management.model.TrainerClassAttendee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TrainerClassAttendeeRepository extends JpaRepository<TrainerClassAttendee, Long> {

    List<TrainerClassAttendee> findByClassId(Long classId);

    long countByClassIdAndStatus(Long classId, TrainerClassAttendee.AttendeeStatus status);

    long countByMemberIdAndStatus(Long memberId, TrainerClassAttendee.AttendeeStatus status);

    void deleteByClassId(Long classId);
}
