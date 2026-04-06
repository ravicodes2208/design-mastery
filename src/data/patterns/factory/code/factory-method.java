// FACTORY METHOD: Creation as a HOOK inside a service class.
// Subclasses decide WHAT to create. Service owns the shared workflow.
// USE WHEN: creation needs PRIVATE knowledge per type (config, keys)
// AND the service has SHARED logic around the product (log, retry, audit).

import java.util.*;

// Product Interface -- same as Simple Factory
interface Notification {
    void send(String message);
    String getChannel();
}

// Concrete Products -- each needs PRIVATE config to construct
class EmailNotification implements Notification {
    private String smtpHost;
    EmailNotification(String smtpHost) { this.smtpHost = smtpHost; }
    public void send(String message) {
        System.out.println("[EMAIL via " + smtpHost + "] " + message);
    }
    public String getChannel() { return "EMAIL"; }
}

class SMSNotification implements Notification {
    private String apiKey;
    SMSNotification(String apiKey) { this.apiKey = apiKey; }
    public void send(String message) {
        System.out.println("[SMS via " + apiKey.substring(0,4) + "***] " + message);
    }
    public String getChannel() { return "SMS"; }
}

// ===== THE ABSTRACT CREATOR (Service) =====
// WHY this class exists:
// 1. createNotification() = FACTORY METHOD -- subclasses override
// 2. sendNotification() = SHARED orchestration -- written ONCE
// Without this, every service duplicates validate/log/audit.
abstract class NotificationService {
    // Factory Method -- subclasses fill in WHAT to create
    protected abstract Notification createNotification();

    // Template Method -- shared workflow using the created product
    public final void sendNotification(String message) {
        validate(message);
        Notification n = createNotification(); // HOOK: subclass decides
        n.send(message);
        log(n.getChannel(), message);
        audit(n.getChannel());
    }

    private void validate(String msg) {
        System.out.println("  Validating: non-empty=" + !msg.isEmpty());
    }
    private void log(String ch, String msg) {
        System.out.println("  [LOG] " + ch + " | " + msg.substring(0, Math.min(20, msg.length())) + "...");
    }
    private void audit(String ch) {
        System.out.println("  [AUDIT] " + ch + " dispatched");
    }
}

// Concrete Creators -- each owns PRIVATE creation knowledge
class EmailNotificationService extends NotificationService {
    protected Notification createNotification() {
        // PRIVATE KNOWLEDGE: only EmailService knows SMTP config
        String host = System.getenv().getOrDefault("SMTP_HOST", "smtp.walmart.com");
        System.out.println("  Loading SMTP config: " + host);
        return new EmailNotification(host);
    }
}

class SMSNotificationService extends NotificationService {
    protected Notification createNotification() {
        // PRIVATE KNOWLEDGE: only SMSService knows the API key source
        String apiKey = "twilio-9x8z";
        System.out.println("  Loading SMS API key from vault");
        return new SMSNotification(apiKey);
    }
}

// Client: holds abstract service reference
public class Main {
    public static void main(String[] args) {
        NotificationService service;

        System.out.println("--- Email Service ---");
        service = new EmailNotificationService();
        service.sendNotification("Order #123 confirmed!");

        System.out.println();

        System.out.println("--- SMS Service ---");
        service = new SMSNotificationService();
        service.sendNotification("Your OTP is 9876");
    }
}