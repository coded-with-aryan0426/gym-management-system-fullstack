package com.gym.management.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:noreply@gymapp.com}")
    private String fromEmail;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String appUrl;

    public void sendWelcomeCredentials(String email, String name, String tempPassword, String role) {
        String subject = "Welcome to AthlonX - Your Login Credentials";
        String body = String.format("""
                Hello %s,

                Welcome to AthlonX! 🎉

                Your %s account has been created.

                --------------------------------------------------

                Login URL:  %s/login
                Email:      %s
                Password:   %s

                --------------------------------------------------

                IMPORTANT:
                • This is a temporary password
                • You will be asked to change it on first login

                Best regards,
                AthlonX Team
                """,
                name,
                role,
                appUrl,
                email,
                tempPassword);

        sendEmail(email, subject, body);
    }

    public void sendOtpEmail(String email, String otp) {
        String subject = "Your Verification Code - AthlonX";
        String body = String.format("""
                Your verification code is: %s

                This code expires in 5 minutes.

                If you didn't request this, please ignore.
                """, otp);

        sendEmail(email, subject, body);
    }

    public void sendSimpleMessage(String to, String subject, String text) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("noreply@athlonx.com");
            message.setTo(to);
            message.setSubject(subject);
            message.setText(text);
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Failed to send email to " + to + ": " + e.getMessage());
            // Consume error to allow auth flow to proceed in dev mode
        }
    }

    private void sendEmail(String to, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            System.out.println("Email sent to " + to);
        } catch (Exception e) {
            System.err.println("Failed to send email to " + to + ": " + e.getMessage());
            // For development, we log the email content so we can "see" it
            System.out.println("--- MOCK EMAIL ---");
            System.out.println("To: " + to);
            System.out.println("Subject: " + subject);
            System.out.println("Body:\n" + body);
            System.out.println("------------------");
        }
    }
}
