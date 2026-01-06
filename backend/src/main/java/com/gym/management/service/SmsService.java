package com.gym.management.service;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * Service for sending SMS and WhatsApp messages via Twilio.
 */
@Service
public class SmsService {

    @Value("${twilio.account.sid:}")
    private String accountSid;

    @Value("${twilio.auth.token:}")
    private String authToken;

    @Value("${twilio.phone.number:}")
    private String fromPhoneNumber;

    @Value("${twilio.whatsapp.number:whatsapp:+14155238886}")
    private String whatsappNumber;

    private boolean initialized = false;

    @PostConstruct
    public void init() {
        if (accountSid != null && !accountSid.isEmpty() &&
                authToken != null && !authToken.isEmpty()) {
            try {
                Twilio.init(accountSid, authToken);
                initialized = true;
                System.out.println("Twilio initialized successfully");
            } catch (Exception e) {
                System.err.println("Failed to initialize Twilio: " + e.getMessage());
            }
        } else {
            System.out.println("Twilio credentials not configured - SMS/WhatsApp disabled");
        }
    }

    /**
     * Send SMS to a phone number.
     */
    public boolean sendSms(String toPhone, String messageBody) {
        if (!initialized) {
            System.err.println("Twilio not initialized - cannot send SMS");
            return false;
        }

        try {
            // Ensure phone number has country code
            String formattedPhone = formatPhoneNumber(toPhone);

            Message message = Message.creator(
                    new PhoneNumber(formattedPhone),
                    new PhoneNumber(fromPhoneNumber),
                    messageBody).create();

            System.out.println("SMS sent: " + message.getSid());
            return true;
        } catch (Exception e) {
            System.err.println("Failed to send SMS: " + e.getMessage());
            return false;
        }
    }

    /**
     * Send WhatsApp message to a phone number.
     */
    public boolean sendWhatsApp(String toPhone, String messageBody) {
        if (!initialized) {
            System.err.println("Twilio not initialized - cannot send WhatsApp");
            return false;
        }

        try {
            String formattedPhone = formatPhoneNumber(toPhone);

            Message message = Message.creator(
                    new PhoneNumber("whatsapp:" + formattedPhone),
                    new PhoneNumber(whatsappNumber),
                    messageBody).create();

            System.out.println("WhatsApp sent: " + message.getSid());
            return true;
        } catch (Exception e) {
            System.err.println("Failed to send WhatsApp: " + e.getMessage());
            return false;
        }
    }

    /**
     * Format phone number to include country code.
     */
    private String formatPhoneNumber(String phone) {
        if (phone == null)
            return "";

        // Remove all non-digit characters except +
        String cleaned = phone.replaceAll("[^+\\d]", "");

        // If doesn't start with +, assume India (+91)
        if (!cleaned.startsWith("+")) {
            if (cleaned.length() == 10) {
                cleaned = "+91" + cleaned;
            } else if (!cleaned.startsWith("91") && cleaned.length() == 12) {
                cleaned = "+" + cleaned;
            }
        }

        return cleaned;
    }

    public boolean isInitialized() {
        return initialized;
    }
}
