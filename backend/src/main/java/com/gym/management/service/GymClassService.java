package com.gym.management.service;

import com.gym.management.dto.ClassBookingDTO;
import com.gym.management.dto.GymClassDTO;
import com.gym.management.model.ClassBooking;
import com.gym.management.model.GymClass;
import com.gym.management.model.User;
import com.gym.management.repository.ClassBookingRepository;
import com.gym.management.repository.GymClassRepository;
import com.gym.management.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.annotation.PostConstruct;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class GymClassService {

    @Autowired
    private GymClassRepository gymClassRepository;

    @Autowired
    private ClassBookingRepository classBookingRepository;

    @Autowired
    private UserRepository userRepository;

    private static final String[] CLASS_TYPES = { "Yoga", "HIIT", "Strength", "Spin", "Pilates", "Boxing", "CrossFit",
            "Group" };
    private static final String[] DIFFICULTIES = { "Beginner", "Intermediate", "Advanced" };
    private static final String[] LOCATIONS = { "Studio A", "Studio B", "Main Floor", "Spin Room", "Boxing Ring" };

    @PostConstruct
    public void initializeDummyClasses() {
        if (gymClassRepository.count() == 0) {
            generateDummyClasses();
        }
    }

    private void generateDummyClasses() {
        List<User> trainers = userRepository.findAll().stream()
                .filter(u -> u.getRoles().stream().anyMatch(r -> r.getRoleName().equals("ROLE_TRAINER")))
                .collect(Collectors.toList());

        if (trainers.isEmpty()) {
            return;
        }

        Random random = new Random();
        LocalDate today = LocalDate.now();

        for (int dayOffset = 0; dayOffset < 14; dayOffset++) {
            LocalDate classDate = today.plusDays(dayOffset);
            int classesPerDay = dayOffset == 0 ? 7 : 5;

            String[] times = { "08:00", "09:30", "11:00", "14:00", "16:30", "18:00", "19:30" };

            for (int i = 0; i < classesPerDay; i++) {
                String[] timeParts = times[i % times.length].split(":");
                LocalDateTime startTime = LocalDateTime.of(classDate,
                        LocalTime.of(Integer.parseInt(timeParts[0]), Integer.parseInt(timeParts[1])));

                if (startTime.isBefore(LocalDateTime.now())) {
                    continue;
                }

                User trainer = trainers.get(random.nextInt(trainers.size()));
                String classType = CLASS_TYPES[random.nextInt(CLASS_TYPES.length)];

                GymClass gymClass = new GymClass();
                gymClass.setClassName(classType + " Class");
                gymClass.setClassType(classType);
                gymClass.setDescription("Join us for an energizing " + classType + " session!");
                gymClass.setTrainer(trainer);
                gymClass.setStartTime(startTime);
                gymClass.setDurationMinutes(new int[] { 45, 60, 75, 90 }[random.nextInt(4)]);
                gymClass.setMaxCapacity(random.nextInt(15) + 10);
                gymClass.setCurrentBookings(random.nextInt(gymClass.getMaxCapacity() / 2));
                gymClass.setDifficulty(DIFFICULTIES[random.nextInt(DIFFICULTIES.length)]);
                gymClass.setLocation(LOCATIONS[random.nextInt(LOCATIONS.length)]);
                gymClass.setStatus(GymClass.ClassStatus.SCHEDULED);

                gymClassRepository.save(gymClass);
            }
        }
    }

    @Transactional(readOnly = true)
    public List<GymClassDTO> getAvailableClasses(Long memberId) {
        LocalDateTime now = LocalDateTime.now();
        List<GymClass> classes = gymClassRepository.findByStartTimeAfterAndStatusOrderByStartTimeAsc(now,
                GymClass.ClassStatus.SCHEDULED);

        Set<Long> bookedClassIds = new HashSet<>();
        Map<Long, Long> bookingIdMap = new HashMap<>();
        Set<Long> waitlistedClassIds = new HashSet<>();

        if (memberId != null) {
            List<ClassBooking> memberBookings = classBookingRepository
                    .findByMemberUserIdAndStatusOrderByBookedAtDesc(memberId, ClassBooking.BookingStatus.CONFIRMED);
            for (ClassBooking booking : memberBookings) {
                bookedClassIds.add(booking.getGymClass().getClassId());
                bookingIdMap.put(booking.getGymClass().getClassId(), booking.getBookingId());
            }
            List<ClassBooking> waitlistBookings = classBookingRepository
                    .findByMemberUserIdAndStatusOrderByBookedAtDesc(memberId, ClassBooking.BookingStatus.WAITLISTED);
            for (ClassBooking booking : waitlistBookings) {
                waitlistedClassIds.add(booking.getGymClass().getClassId());
            }
        }

        return classes.stream()
                .map(gc -> toDTO(gc, bookedClassIds.contains(gc.getClassId()), bookingIdMap.get(gc.getClassId()),
                        waitlistedClassIds.contains(gc.getClassId())))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<GymClassDTO> getTodaysClasses(Long memberId) {
        LocalDate today = LocalDate.now();
        LocalDateTime startOfDay = today.atStartOfDay();
        LocalDateTime endOfDay = today.plusDays(1).atStartOfDay();

        List<GymClass> classes = gymClassRepository.findTodaysClasses(startOfDay, endOfDay);

        Set<Long> bookedClassIds = new HashSet<>();
        Map<Long, Long> bookingIdMap = new HashMap<>();
        Set<Long> waitlistedClassIds = new HashSet<>();

        if (memberId != null) {
            List<ClassBooking> memberBookings = classBookingRepository
                    .findByMemberUserIdAndStatusOrderByBookedAtDesc(memberId, ClassBooking.BookingStatus.CONFIRMED);
            for (ClassBooking booking : memberBookings) {
                bookedClassIds.add(booking.getGymClass().getClassId());
                bookingIdMap.put(booking.getGymClass().getClassId(), booking.getBookingId());
            }
            List<ClassBooking> waitlistBookings = classBookingRepository
                    .findByMemberUserIdAndStatusOrderByBookedAtDesc(memberId, ClassBooking.BookingStatus.WAITLISTED);
            for (ClassBooking booking : waitlistBookings) {
                waitlistedClassIds.add(booking.getGymClass().getClassId());
            }
        }

        return classes.stream()
                .filter(gc -> gc.getStartTime().isAfter(LocalDateTime.now()))
                .map(gc -> toDTO(gc, bookedClassIds.contains(gc.getClassId()), bookingIdMap.get(gc.getClassId()),
                        waitlistedClassIds.contains(gc.getClassId())))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ClassBookingDTO> getMemberBookings(Long memberId) {
        List<ClassBooking> bookings = classBookingRepository.findUpcomingBookings(memberId);
        return bookings.stream()
                .map(this::toBookingDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Long getMemberBookingsCount(Long memberId) {
        return classBookingRepository.countMemberBookings(memberId);
    }

    @Transactional
    public ClassBookingDTO bookClass(Long classId, Long memberId) {
        GymClass gymClass = gymClassRepository.findById(classId)
                .orElseThrow(() -> new IllegalArgumentException("Class not found"));

        User member = userRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("Member not found"));

        Optional<ClassBooking> existingBooking = classBookingRepository.findExistingBooking(memberId, classId);
        if (existingBooking.isPresent()) {
            throw new IllegalArgumentException("You have already booked this class");
        }

        // Check if already on waitlist
        boolean alreadyWaitlisted = classBookingRepository.existsByGymClassClassIdAndMemberUserIdAndStatus(
                classId, memberId, ClassBooking.BookingStatus.WAITLISTED);
        if (alreadyWaitlisted) {
            throw new IllegalArgumentException("You are already on the waitlist for this class");
        }

        if (gymClass.getStartTime().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("This class has already started");
        }

        // If class is full → create a WAITLISTED booking instead of throwing
        if (gymClass.getSpotsLeft() <= 0) {
            ClassBooking waitlistBooking = new ClassBooking();
            waitlistBooking.setGymClass(gymClass);
            waitlistBooking.setMember(member);
            waitlistBooking.setStatus(ClassBooking.BookingStatus.WAITLISTED);
            ClassBooking saved = classBookingRepository.save(waitlistBooking);
            return toBookingDTO(saved);
        }

        ClassBooking booking = new ClassBooking();
        booking.setGymClass(gymClass);
        booking.setMember(member);
        booking.setStatus(ClassBooking.BookingStatus.CONFIRMED);

        gymClass.setCurrentBookings(gymClass.getCurrentBookings() + 1);
        if (gymClass.getSpotsLeft() <= 0) {
            gymClass.setStatus(GymClass.ClassStatus.FULL);
        }

        gymClassRepository.save(gymClass);
        ClassBooking saved = classBookingRepository.save(booking);

        return toBookingDTO(saved);
    }

    @Transactional
    public void cancelBooking(Long bookingId, Long memberId) {
        ClassBooking booking = classBookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));

        if (!booking.getMember().getUserId().equals(memberId)) {
            throw new IllegalArgumentException("You can only cancel your own bookings");
        }

        if (booking.getStatus() != ClassBooking.BookingStatus.CONFIRMED) {
            throw new IllegalArgumentException("This booking is not active");
        }

        booking.setStatus(ClassBooking.BookingStatus.CANCELLED);
        booking.setCancelledAt(LocalDateTime.now());

        GymClass gymClass = booking.getGymClass();
        gymClass.setCurrentBookings(Math.max(0, gymClass.getCurrentBookings() - 1));
        if (gymClass.getStatus() == GymClass.ClassStatus.FULL) {
            gymClass.setStatus(GymClass.ClassStatus.SCHEDULED);
        }

        gymClassRepository.save(gymClass);
        classBookingRepository.save(booking);
    }

    public GymClassDTO createClass(GymClassDTO dto) {
        GymClass gymClass = new GymClass();
        gymClass.setClassName(dto.getClassName());
        gymClass.setClassType(dto.getClassType());
        gymClass.setDescription(dto.getDescription());
        gymClass.setStartTime(dto.getStartTime());
        gymClass.setDurationMinutes(dto.getDurationMinutes());
        gymClass.setMaxCapacity(dto.getMaxCapacity());
        gymClass.setDifficulty(dto.getDifficulty());
        gymClass.setLocation(dto.getLocation());
        gymClass.setRecurring(dto.getRecurring());
        gymClass.setRecurrencePattern(dto.getRecurrencePattern());

        if (dto.getTrainerId() != null) {
            User trainer = userRepository.findById(dto.getTrainerId())
                    .orElseThrow(() -> new IllegalArgumentException("Trainer not found"));
            gymClass.setTrainer(trainer);
        }

        GymClass saved = gymClassRepository.save(gymClass);
        return toDTO(saved, false, null);
    }

    private GymClassDTO toDTO(GymClass gc, boolean isBooked, Long bookingId) {
        return toDTO(gc, isBooked, bookingId, false);
    }

    private GymClassDTO toDTO(GymClass gc, boolean isBooked, Long bookingId, boolean isWaitlisted) {
        GymClassDTO dto = new GymClassDTO();
        dto.setClassId(gc.getClassId());
        dto.setClassName(gc.getClassName());
        dto.setClassType(gc.getClassType());
        dto.setDescription(gc.getDescription());
        dto.setStartTime(gc.getStartTime());
        dto.setDurationMinutes(gc.getDurationMinutes());
        dto.setMaxCapacity(gc.getMaxCapacity());
        dto.setCurrentBookings(gc.getCurrentBookings());
        dto.setSpotsLeft(gc.getSpotsLeft());
        dto.setDifficulty(gc.getDifficulty());
        dto.setLocation(gc.getLocation());
        dto.setStatus(gc.getStatus().name());
        dto.setRecurring(gc.getRecurring());
        dto.setRecurrencePattern(gc.getRecurrencePattern());
        dto.setIsBooked(isBooked);
        dto.setBookingId(bookingId);
        dto.setIsWaitlisted(isWaitlisted);

        if (gc.getTrainer() != null) {
            dto.setTrainerId(gc.getTrainer().getUserId());
            dto.setTrainerName(gc.getTrainer().getFullName());
        }

        return dto;
    }

    private ClassBookingDTO toBookingDTO(ClassBooking cb) {
        ClassBookingDTO dto = new ClassBookingDTO();
        dto.setBookingId(cb.getBookingId());
        dto.setStatus(cb.getStatus().name());
        dto.setBookedAt(cb.getBookedAt());
        dto.setCancelledAt(cb.getCancelledAt());
        dto.setAttended(cb.getAttended());
        dto.setNotes(cb.getNotes());

        if (cb.getMember() != null) {
            dto.setMemberId(cb.getMember().getUserId());
            dto.setMemberName(cb.getMember().getFullName());
        }

        if (cb.getGymClass() != null) {
            GymClass gc = cb.getGymClass();
            dto.setClassId(gc.getClassId());
            dto.setClassName(gc.getClassName());
            dto.setClassType(gc.getClassType());
            dto.setClassStartTime(gc.getStartTime());
            dto.setDurationMinutes(gc.getDurationMinutes());
            dto.setLocation(gc.getLocation());
            dto.setDifficulty(gc.getDifficulty());

            if (gc.getTrainer() != null) {
                dto.setTrainerName(gc.getTrainer().getFullName());
            }
        }

        return dto;
    }
}
