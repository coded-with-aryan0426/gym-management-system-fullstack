package com.gym.subscription.controller;

import com.gym.subscription.webhook.PaddleWebhookHandler;
import com.gym.subscription.webhook.PayPalWebhookHandler;
import com.gym.subscription.webhook.RazorpayWebhookHandler;
import com.gym.subscription.webhook.StripeWebhookHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/webhooks")
@RequiredArgsConstructor
public class WebhookController {

    private final StripeWebhookHandler stripeWebhookHandler;
    private final PayPalWebhookHandler paypalWebhookHandler;
    private final PaddleWebhookHandler paddleWebhookHandler;
    private final RazorpayWebhookHandler razorpayWebhookHandler;

    @PostMapping("/stripe")
    public ResponseEntity<String> handleStripeWebhook(
            @RequestBody String payload,
            @RequestHeader(value = "Stripe-Signature", required = false) String signature) {
        try {
            stripeWebhookHandler.handleWebhook(payload, signature != null ? signature : "");
            return ResponseEntity.ok("OK");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @PostMapping("/paypal")
    public ResponseEntity<String> handlePaypalWebhook(@RequestBody String payload) {
        try {
            paypalWebhookHandler.handleWebhook(payload);
            return ResponseEntity.ok("OK");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @PostMapping("/paddle")
    public ResponseEntity<String> handlePaddleWebhook(@RequestBody String payload) {
        try {
            paddleWebhookHandler.handleWebhook(payload);
            return ResponseEntity.ok("OK");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @PostMapping("/razorpay")
    public ResponseEntity<String> handleRazorpayWebhook(
            @RequestBody String payload,
            @RequestHeader(value = "X-Razorpay-Signature", required = false) String signature) {
        try {
            razorpayWebhookHandler.handleWebhook(payload, signature != null ? signature : "");
            return ResponseEntity.ok("OK");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
}
