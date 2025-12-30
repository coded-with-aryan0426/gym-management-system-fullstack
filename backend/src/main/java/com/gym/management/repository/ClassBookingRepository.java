package com.gym.management.repository;

import com.gym.management.model.ClassBooking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClassBookingRepository extends JpaRepository<ClassBooking, Long> {

    List<ClassBooking> findByMemberUserId(Long memberId);

    List<ClassBooking> findByClassId(Long classId);

    List<ClassBooking> findByMemberUserIdAndStatus(Long memberId, String status);

    @Query("SELECT cb FROM ClassBooking cb WHERE cb.member.userId = :memberId AND cb.status = 'BOOKED' ORDER BY cb.bookingDate DESC")
    List<ClassBooking> findActiveBookingsByMember(@Param("memberId") Long memberId);

    @Query("SELECT COUNT(cb) FROM ClassBooking cb WHERE cb.classId = :classId AND cb.status = 'BOOKED'")
    Long countBookedByClassId(@Param("classId") Long classId);

    boolean existsByClassIdAndMemberUserIdAndStatus(Long classId, Long memberId, String status);
}
