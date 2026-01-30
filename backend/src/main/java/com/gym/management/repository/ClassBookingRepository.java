package com.gym.management.repository;

import com.gym.management.model.ClassBooking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClassBookingRepository extends JpaRepository<ClassBooking, Long> {

    List<ClassBooking> findByMemberUserIdAndStatusOrderByBookedAtDesc(Long memberId, ClassBooking.BookingStatus status);

    List<ClassBooking> findByMemberUserIdOrderByBookedAtDesc(Long memberId);

    List<ClassBooking> findByGymClassClassIdAndStatus(Long classId, ClassBooking.BookingStatus status);

    @Query("SELECT cb FROM ClassBooking cb WHERE cb.member.userId = :memberId AND cb.gymClass.classId = :classId AND cb.status = 'CONFIRMED'")
    Optional<ClassBooking> findExistingBooking(@Param("memberId") Long memberId, @Param("classId") Long classId);

    @Query("SELECT COUNT(cb) FROM ClassBooking cb WHERE cb.member.userId = :memberId AND cb.status = 'CONFIRMED'")
    Long countMemberBookings(@Param("memberId") Long memberId);

    @Query("SELECT cb FROM ClassBooking cb WHERE cb.gymClass.classId = :classId AND cb.status = 'CONFIRMED'")
    List<ClassBooking> findConfirmedBookingsForClass(@Param("classId") Long classId);

    @Query("SELECT cb FROM ClassBooking cb JOIN FETCH cb.member m JOIN FETCH cb.gymClass gc JOIN FETCH gc.trainer t WHERE m.userId = :memberId AND gc.startTime > CURRENT_TIMESTAMP AND cb.status = 'CONFIRMED' ORDER BY gc.startTime ASC")
    List<ClassBooking> findUpcomingBookings(@Param("memberId") Long memberId);
}
