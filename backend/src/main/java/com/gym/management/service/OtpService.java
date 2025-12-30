package com.gym.management.service;

import com.gym.management.model.OtpPurpose;
import com.gym.management.model.OtpRecord;
import com.gym.management.repository.OtpRecordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

@Service
public class OtpService {

    @Autowired
    private OtpRecordRepository otpRecordRepository;

    @Autowired
    private EmailService emailService;

    public void generateAndSendOtp(String email, OtpPurpose purpose) {
        String otp = String.format("%06d", new Random().nextInt(999999));

        OtpRecord record = new OtpRecord();
        record.setEmail(email);
        record.setOtpCode(otp);
        record.setPurpose(purpose);
        record.setExpiresAt(LocalDateTime.now().plusMinutes(5));

        otpRecordRepository.save(record);
        emailService.sendOtpEmail(email, otp);
    }

    public boolean verifyOtp(String email, String otp, OtpPurpose purpose) {
        Optional<OtpRecord> recordOpt = otpRecordRepository
                .findTopByEmailAndPurposeAndIsUsedFalseOrderByCreatedAtDesc(email, purpose);

        if (recordOpt.isEmpty()) {
            return false;
        }

        OtpRecord record = recordOpt.get();
        if (record.getExpiresAt().isBefore(LocalDateTime.now())) {
            return false;
        }

        if (!record.getOtpCode().equals(otp)) {
            return false;
        }

        // Mark as used
        record.setIsUsed(true);
        otpRecordRepository.save(record);
        return true;
    }
}
